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
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new CurlyWalker(sourceFile, this.getOptions()));
    };
    Rule.DO_FAILURE_STRING = "do statements must be braced";
    Rule.ELSE_FAILURE_STRING = "else statements must be braced";
    Rule.FOR_FAILURE_STRING = "for statements must be braced";
    Rule.IF_FAILURE_STRING = "if statements must be braced";
    Rule.WHILE_FAILURE_STRING = "while statements must be braced";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var CurlyWalker = (function (_super) {
    __extends(CurlyWalker, _super);
    function CurlyWalker() {
        _super.apply(this, arguments);
    }
    CurlyWalker.prototype.visitForInStatement = function (node) {
        if (!this.isStatementBraced(node.statement)) {
            this.addFailureForNode(node, Rule.FOR_FAILURE_STRING);
        }
        _super.prototype.visitForInStatement.call(this, node);
    };
    CurlyWalker.prototype.visitForOfStatement = function (node) {
        if (!this.isStatementBraced(node.statement)) {
            this.addFailureForNode(node, Rule.FOR_FAILURE_STRING);
        }
        _super.prototype.visitForInStatement.call(this, node);
    };
    CurlyWalker.prototype.visitForStatement = function (node) {
        if (!this.isStatementBraced(node.statement)) {
            this.addFailureForNode(node, Rule.FOR_FAILURE_STRING);
        }
        _super.prototype.visitForStatement.call(this, node);
    };
    CurlyWalker.prototype.visitIfStatement = function (node) {
        if (!this.isStatementBraced(node.thenStatement)) {
            this.addFailure(this.createFailure(node.getStart(), node.thenStatement.getEnd() - node.getStart(), Rule.IF_FAILURE_STRING));
        }
        if (node.elseStatement != null
            && node.elseStatement.kind !== 194 /* IfStatement */
            && !this.isStatementBraced(node.elseStatement)) {
            // find the else keyword to place the error appropriately
            var elseKeywordNode = node.getChildren().filter(function (child) { return child.kind === 78 /* ElseKeyword */; })[0];
            this.addFailure(this.createFailure(elseKeywordNode.getStart(), node.elseStatement.getEnd() - elseKeywordNode.getStart(), Rule.ELSE_FAILURE_STRING));
        }
        _super.prototype.visitIfStatement.call(this, node);
    };
    CurlyWalker.prototype.visitDoStatement = function (node) {
        if (!this.isStatementBraced(node.statement)) {
            this.addFailureForNode(node, Rule.DO_FAILURE_STRING);
        }
        _super.prototype.visitDoStatement.call(this, node);
    };
    CurlyWalker.prototype.visitWhileStatement = function (node) {
        if (!this.isStatementBraced(node.statement)) {
            this.addFailureForNode(node, Rule.WHILE_FAILURE_STRING);
        }
        _super.prototype.visitWhileStatement.call(this, node);
    };
    CurlyWalker.prototype.isStatementBraced = function (node) {
        return node.kind === 190 /* Block */;
    };
    CurlyWalker.prototype.addFailureForNode = function (node, failure) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), failure));
    };
    return CurlyWalker;
})(Lint.RuleWalker);