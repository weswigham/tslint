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

import {TestUtils} from "../lint";

describe("<variable-name>", () => {
    const VariableNameRule = TestUtils.getRule("variable-name");
    const failureString = VariableNameRule.FORMAT_FAILURE;
    const fileName = "rules/varname.test.ts";
    const createFailure = TestUtils.createFailuresOnFile(fileName, failureString);

    it("ensures only (camel/upper)case naming convention for variables & parameters", () => {
        const expectedFailures = [
            createFailure([3, 5], [3, 17]),
            createFailure([4, 5], [4, 18]),
            createFailure([7, 13], [7, 26]),
            createFailure([8, 13], [8, 29]),
            createFailure([13, 13], [13, 25]),
            createFailure([19, 48], [19, 56]),
            createFailure([19, 58], [19, 68]),
            createFailure([24, 7], [24, 17]),
            createFailure([24, 19], [24, 30]),
            createFailure([24, 35], [24, 46]),
            createFailure([26, 56], [26, 69]),
            createFailure([26, 71], [26, 84]),
            createFailure([30, 43], [30, 54]),
            createFailure([34, 5], [34, 21]),
            createFailure([35, 5], [35, 19])
        ];

        const actualFailures = TestUtils.applyRuleOnFile(fileName, VariableNameRule);
        TestUtils.assertFailuresEqual(actualFailures, expectedFailures);
    });

    it("ensures leading underscores can optionally be legal", () => {
        const options = [true,
            "allow-leading-underscore"
        ];

        const actualFailures = TestUtils.applyRuleOnFile(fileName, VariableNameRule, options);
        const optionallyValidFailures = [
            createFailure([8, 13], [8, 29])
        ];

        // none of the optionally valid names should appear in the failures list
        assert.isFalse(actualFailures.some((failure) => {
            return optionallyValidFailures.some((f) => f.equals(failure));
        }));
    });

    it("ensures trailing underscores can optionally be legal", () => {
        const options = [true,
            "allow-trailing-underscore"
        ];

        const actualFailures = TestUtils.applyRuleOnFile(fileName, VariableNameRule, options);
        const optionallyValidFailures = [
            createFailure([34, 5], [34, 21])
        ];

        // none of the optionally valid names should appear in the failures list
        assert.isFalse(actualFailures.some((failure) => {
            return optionallyValidFailures.some((f) => f.equals(failure));
        }));
    });

    it("ensures leading & trailing underscores can optionally be legal", () => {
        const options = [true,
            "allow-leading-underscore",
            "allow-trailing-underscore"
        ];

        const actualFailures = TestUtils.applyRuleOnFile(fileName, VariableNameRule, options);
        const optionallyValidFailures = [
            createFailure([35, 5], [35, 19])
        ];

        // none of the optionally valid names should appear in the failures list
        assert.isFalse(actualFailures.some((failure) => {
            return optionallyValidFailures.some((f) => f.equals(failure));
        }));
    });

    it("ensures keywords can optionally be banned", () => {
        const file = "rules/varname-keywords.test.ts";
        const failure = TestUtils.createFailuresOnFile(file, VariableNameRule.KEYWORD_FAILURE);
        const options = [true, "ban-keywords"];

        const expectedFailures = [
            failure([1, 5], [1, 14]),
            failure([2, 5], [2, 12]),
            failure([3, 14], [3, 17]),
            failure([4, 6], [4, 12]),
            failure([5, 6], [5, 12])
        ];

        const actualFailures = TestUtils.applyRuleOnFile(file, VariableNameRule, options);
        TestUtils.assertFailuresEqual(actualFailures, expectedFailures);
    });
});
