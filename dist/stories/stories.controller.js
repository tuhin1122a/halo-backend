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
exports.StoriesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const stories_service_1 = require("./stories.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StoriesController = class StoriesController {
    storiesService;
    constructor(storiesService) {
        this.storiesService = storiesService;
    }
    async uploadStory(req, file, durationHours) {
        const hours = durationHours ? parseInt(durationHours, 10) : 24;
        return this.storiesService.createStory(req.user.userId, file, hours);
    }
    async getFeed(req) {
        return this.storiesService.getFeedStories(req.user.userId);
    }
    async deleteStory(req, id) {
        return this.storiesService.deleteStory(req.user.userId, id);
    }
    async viewStory(req, storyId) {
        return this.storiesService.viewStory(req.user.userId, storyId);
    }
    async reactStory(req, storyId, reaction) {
        return this.storiesService.reactStory(req.user.userId, storyId, reaction);
    }
};
exports.StoriesController = StoriesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('durationHours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "uploadStory", null);
__decorate([
    (0, common_1.Get)('feed'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "deleteStory", null);
__decorate([
    (0, common_1.Post)('view/:storyId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('storyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "viewStory", null);
__decorate([
    (0, common_1.Post)('react/:storyId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('storyId')),
    __param(2, (0, common_1.Body)('reaction')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "reactStory", null);
exports.StoriesController = StoriesController = __decorate([
    (0, common_1.Controller)('stories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stories_service_1.StoriesService])
], StoriesController);
//# sourceMappingURL=stories.controller.js.map