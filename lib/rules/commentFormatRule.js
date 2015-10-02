var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var Lint = require("../lint");
var ts = require("typescript");
var OPTION_SPACE = "check-space";
var OPTION_LOWERCASE = "check-lowercase";
var OPTION_UPPERCASE = "check-uppercase";
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new CommentWalker(sourceFile, this.getOptions()));
    };
    Rule.LOWERCASE_FAILURE = "comment must start with lowercase letter";
    Rule.UPPERCASE_FAILURE = "comment must start with uppercase letter";
    Rule.LEADING_SPACE_FAILURE = "comment must start with a space";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var CommentWalker = (function (_super) {
    __extends(CommentWalker, _super);
    function CommentWalker() {
        _super.apply(this, arguments);
    }
    CommentWalker.prototype.visitSourceFile = function (node) {
        var _this = this;
        _super.prototype.visitSourceFile.call(this, node);
        Lint.scanAllTokens(ts.createScanner(1 /* ES5 */, false, 0 /* Standard */, node.text), function (scanner) {
            var startPos = scanner.getStartPos();
            if (_this.tokensToSkipStartEndMap[startPos] != null) {
                // tokens to skip are places where the scanner gets confused about what the token is, without the proper context
                // (specifically, regex, identifiers, and templates). So skip those tokens.
                scanner.setTextPos(_this.tokensToSkipStartEndMap[startPos]);
                return;
            }
            if (scanner.getToken() === 2 /* SingleLineCommentTrivia */) {
                var commentText = scanner.getTokenText();
                var startPosition = scanner.getTokenPos() + 2;
                var width = commentText.length - 2;
                if (_this.hasOption(OPTION_SPACE)) {
                    if (!_this.startsWithSpace(commentText)) {
                        var leadingSpaceFailure = _this.createFailure(startPosition, width, Rule.LEADING_SPACE_FAILURE);
                        _this.addFailure(leadingSpaceFailure);
                    }
                }
                if (_this.hasOption(OPTION_LOWERCASE)) {
                    if (!_this.startsWithLowercase(commentText)) {
                        var lowercaseFailure = _this.createFailure(startPosition, width, Rule.LOWERCASE_FAILURE);
                        _this.addFailure(lowercaseFailure);
                    }
                }
                if (_this.hasOption(OPTION_UPPERCASE)) {
                    if (!_this.startsWithUppercase(commentText)) {
                        var uppercaseFailure = _this.createFailure(startPosition, width, Rule.UPPERCASE_FAILURE);
                        _this.addFailure(uppercaseFailure);
                    }
                }
            }
        });
    };
    CommentWalker.prototype.startsWithSpace = function (commentText) {
        if (commentText.length <= 2) {
            return true; // comment is "//"? Technically not a violation.
        }
        // whitelist //#region and //#endregion
        if ((/^#(end)?region/).test(commentText.substring(2))) {
            return true;
        }
        var firstCharacter = commentText.charAt(2); // first character after the space
        // three slashes (///) also works, to allow for ///<reference>
        return firstCharacter === " " || firstCharacter === "/";
    };
    CommentWalker.prototype.startsWithLowercase = function (commentText) {
        return this.startsWith(commentText, function (c) { return c.toLowerCase(); });
    };
    CommentWalker.prototype.startsWithUppercase = function (commentText) {
        return this.startsWith(commentText, function (c) { return c.toUpperCase(); });
    };
    CommentWalker.prototype.startsWith = function (commentText, changeCase) {
        if (commentText.length <= 2) {
            return true; // comment is "//"? Technically not a violation.
        }
        // regex is "start of string"//"any amount of whitespace"("word character")
        var firstCharacterMatch = commentText.match(/^\/\/\s*(\w)/);
        if (firstCharacterMatch != null) {
            // the first group matched, i.e. the thing in the parens, is the first non-space character, if it's alphanumeric
            var firstCharacter = firstCharacterMatch[1];
            return firstCharacter === changeCase(firstCharacter);
        }
        else {
            // first character isn't alphanumeric/doesn't exist? Technically not a violation
            return true;
        }
    };
    return CommentWalker;
})(Lint.SkippableTokenAwareRuleWalker);