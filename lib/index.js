"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var withRouter_1 = __importDefault(require("./withRouter"));
var withNarrowerAppState_1 = __importDefault(require("./withNarrowerAppState"));
exports.withNarrowerAppState = withNarrowerAppState_1.default;
exports.default = withRouter_1.default;
