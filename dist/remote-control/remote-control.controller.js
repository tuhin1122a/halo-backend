"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteControlController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const remote_control_service_1 = require("./remote-control.service");
let RemoteControlController = class RemoteControlController {
    remoteControlService;
    constructor(remoteControlService) {
        this.remoteControlService = remoteControlService;
    }
    async getDevices(req) {
        return this.remoteControlService.getUserDevices(req.user.userId);
    }
    async getDevice(id) {
        return this.remoteControlService.getDevice(id);
    }
    async deleteDevice(id) {
        return this.remoteControlService.deleteDevice(id);
    }
    async getSession(id) {
        return this.remoteControlService.getSession(id);
    }
    async endSession(id) {
        return this.remoteControlService.endSession(id);
    }
    async getSessionCommands(id) {
        return this.remoteControlService.getSessionCommands(id);
    }
};
exports.RemoteControlController = RemoteControlController;
__decorate([
    (0, common_1.Get)('devices'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RemoteControlController.prototype, "getDevices", null);
__decorate([
    (0, common_1.Get)('devices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemoteControlController.prototype, "getDevice", null);
__decorate([
    (0, common_1.Delete)('devices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemoteControlController.prototype, "deleteDevice", null);
__decorate([
    (0, common_1.Get)('sessions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemoteControlController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('sessions/:id/end'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemoteControlController.prototype, "endSession", null);
__decorate([
    (0, common_1.Get)('sessions/:id/commands'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemoteControlController.prototype, "getSessionCommands", null);
exports.RemoteControlController = RemoteControlController = __decorate([
    (0, common_1.Controller)('remote-control'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [remote_control_service_1.RemoteControlService])
], RemoteControlController);
//# sourceMappingURL=remote-control.controller.js.map