"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteControlModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const remote_control_controller_1 = require("./remote-control.controller");
const remote_control_gateway_1 = require("./remote-control.gateway");
const remote_control_service_1 = require("./remote-control.service");
const jwt_1 = require("@nestjs/jwt");
let RemoteControlModule = class RemoteControlModule {
};
exports.RemoteControlModule = RemoteControlModule;
exports.RemoteControlModule = RemoteControlModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secretKey',
                signOptions: { expiresIn: '365d' },
            }),
        ],
        controllers: [remote_control_controller_1.RemoteControlController],
        providers: [remote_control_service_1.RemoteControlService, remote_control_gateway_1.RemoteControlGateway],
        exports: [remote_control_service_1.RemoteControlService],
    })
], RemoteControlModule);
//# sourceMappingURL=remote-control.module.js.map