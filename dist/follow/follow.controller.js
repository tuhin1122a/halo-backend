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
exports.FollowController = void 0;
const common_1 = require("@nestjs/common");
const follow_service_1 = require("./follow.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let FollowController = class FollowController {
    followService;
    constructor(followService) {
        this.followService = followService;
    }
    follow(req, userId) {
        return this.followService.followUser(req.user.userId, userId);
    }
    accept(req, userId) {
        return this.followService.acceptFollow(req.user.userId, userId);
    }
    decline(req, userId) {
        return this.followService.declineFollow(req.user.userId, userId);
    }
    unfollow(req, userId) {
        return this.followService.unfollowUser(req.user.userId, userId);
    }
    status(req, userId) {
        return this.followService.getFollowStatus(req.user.userId, userId);
    }
    following(req) {
        return this.followService.getFollowing(req.user.userId);
    }
    requests(req) {
        return this.followService.getIncomingRequests(req.user.userId);
    }
};
exports.FollowController = FollowController;
__decorate([
    (0, common_1.Post)(':userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FollowController.prototype, "follow", null);
__decorate([
    (0, common_1.Post)('accept/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FollowController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)('decline/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FollowController.prototype, "decline", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FollowController.prototype, "unfollow", null);
__decorate([
    (0, common_1.Get)('status/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FollowController.prototype, "status", null);
__decorate([
    (0, common_1.Get)('following'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FollowController.prototype, "following", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FollowController.prototype, "requests", null);
exports.FollowController = FollowController = __decorate([
    (0, common_1.Controller)('follow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [follow_service_1.FollowService])
], FollowController);
//# sourceMappingURL=follow.controller.js.map