/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Linter = require("./tslint");
var fs = require("fs");
var optimist = require("optimist");
optimist
    .usage("Usage: $0 [options] [file ...]")
    .check(function (argv) {
    // at least one of file, help, version or unqualified argument must be present
    if (!(argv.h || argv.v || argv._.length > 0)) {
        throw "Missing files";
    }
    if (argv.f) {
        throw "-f option is no longer available. Supply files directly to the tslint command instead.";
    }
})
    .options({
    "c": {
        alias: "config",
        describe: "configuration file"
    },
    "h": {
        alias: "help",
        describe: "display detailed help"
    },
    "o": {
        alias: "out",
        describe: "output file"
    },
    "r": {
        alias: "rules-dir",
        describe: "rules directory"
    },
    "s": {
        alias: "formatters-dir",
        describe: "formatters directory"
    },
    "t": {
        alias: "format",
        default: "prose",
        describe: "output format (prose, json, verbose)"
    },
    "v": {
        alias: "version",
        describe: "current version"
    }
});
var argv = optimist.argv;
var outputStream;
if (argv.o !== undefined) {
    outputStream = fs.createWriteStream(argv.o, {
        flags: "w+",
        mode: 420
    });
}
else {
    outputStream = process.stdout;
}
if (argv.v !== undefined) {
    outputStream.write(Linter.VERSION + "\n");
    process.exit(0);
}
if ("help" in argv) {
    outputStream.write(optimist.help());
    var outputString = "\ntslint accepts the following commandline options:\n\n    -c, --config:\n        The location of the configuration file that tslint will use to\n        determine which rules are activated and what options to provide\n        to the rules. If no option is specified, the config file named\n        tslint.json is used, so long as it exists in the path.\n        The format of the file is { rules: { /* rules list */ } },\n        where /* rules list */ is a key: value comma-seperated list of\n        rulename: rule-options pairs. Rule-options can be either a\n        boolean true/false value denoting whether the rule is used or not,\n        or a list [boolean, ...] where the boolean provides the same role\n        as in the non-list case, and the rest of the list are options passed\n        to the rule that will determine what it checks for (such as number\n        of characters for the max-line-length rule, or what functions to ban\n        for the ban rule).\n\n    -o, --out:\n        A filename to output the results to. By default, tslint outputs to\n        stdout, which is usually the console where you're running it from.\n\n    -r, --rules-dir:\n        An additional rules directory, for additional user-created rules.\n        tslint will always check its default rules directory, in\n        node_modules/tslint/build/rules, before checking the user-provided\n        rules directory, so rules in the user-provided rules directory\n        with the same name as the base rules will not be loaded.\n\n    -s, --formatters-dir:\n        An additional formatters directory, for user-created formatters.\n        Formatters are files that will format the tslint output, before\n        writing it to stdout or the file passed in --out. The default\n        directory, node_modules/tslint/build/formatters, will always be\n        checked first, so user-created formatters with the same names\n        as the base formatters will not be loaded.\n\n    -t, --format:\n        The formatter to use to format the results of the linter before\n        outputting it to stdout or the file passed in --out. The core\n        formatters are prose (human readable), json (machine readable)\n        and verbose. prose is the default if this option is not used. Additonal\n        formatters can be added and used if the --formatters-dir option is set.\n\n    -v, --version:\n        The current version of tslint.\n\n    -h, --help:\n        Prints this help message.\n";
    outputStream.write(outputString);
    process.exit(0);
}
// when provided, it should point to an existing location
if (argv.c && !fs.existsSync(argv.c)) {
    console.error("Invalid option for configuration: " + argv.c);
    process.exit(1);
}
var processFile = function (file) {
    if (!fs.existsSync(file)) {
        console.error("Unable to open file: " + file);
        process.exit(1);
    }
    var contents = fs.readFileSync(file, "utf8");
    var configuration = Linter.findConfiguration(argv.c, file);
    if (configuration === undefined) {
        console.error("unable to find tslint configuration");
        process.exit(1);
    }
    var linter = new Linter(file, contents, {
        configuration: configuration,
        formatter: argv.t,
        formattersDirectory: argv.s,
        rulesDirectory: argv.r
    });
    var lintResult = linter.lint();
    if (lintResult.failureCount > 0) {
        outputStream.write(lintResult.output, function () {
            process.exit(2);
        });
    }
};
var files = argv._;
for (var _i = 0; _i < files.length; _i++) {
    var file = files[_i];
    processFile(file);
}