"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const cloudinary_service_1 = require("../common/cloudinary.service");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    cloudinaryService;
    constructor(usersService, cloudinaryService) {
        this.usersService = usersService;
        this.cloudinaryService = cloudinaryService;
    }
    findAll(req) {
        if (req.user?.role !== 'ADMIN') {
            throw new common_1.BadRequestException('Unauthorized: Only admins can list users');
        }
        return this.usersService.findAll();
    }
    getOwnProfile(req) {
        return this.usersService.findProfile(req.user.userId);
    }
    async checkUsername(req, username) {
        if (!username || username.trim().length === 0) {
            throw new common_1.BadRequestException('Username is required');
        }
        const cleanUsername = username.trim().toLowerCase();
        const existing = await this.usersService.findByUsername(cleanUsername);
        const isAvailable = !existing || existing.id === req.user.userId;
        return { username: cleanUsername, available: isAvailable };
    }
    searchUsers(q) {
        if (!q || q.trim().length === 0)
            return [];
        return this.usersService.searchUsers(q.trim());
    }
    findOne(id) {
        return this.usersService.findProfile(id);
    }
    async updateProfileInfo(req, body) {
        const data = {};
        if (body.name !== undefined)
            data.name = body.name;
        if (body.username !== undefined)
            data.username = body.username;
        if (body.bio !== undefined)
            data.bio = body.bio;
        if (body.address !== undefined)
            data.address = body.address;
        if (body.education !== undefined)
            data.education = body.education;
        if (body.password) {
            data.password = await bcrypt.hash(body.password, 10);
        }
        return this.usersService.update(req.user.userId, data);
    }
    async update(req, updateDto) {
        const data = { ...updateDto };
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        else {
            delete data.password;
        }
        return this.usersService.update(req.user.userId, data);
    }
    async remove(req, id) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.BadRequestException('Unauthorized: Only admins can delete users');
        }
        return this.usersService.remove(id);
    }
    async uploadAvatar(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        try {
            const url = await this.cloudinaryService.uploadImage(file);
            await this.usersService.update(req.user.userId, { avatarUrl: url });
            return { url };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload avatar: ' + error.message);
        }
    }
    async uploadCover(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        try {
            const url = await this.cloudinaryService.uploadImage(file);
            await this.usersService.update(req.user.userId, { coverImageUrl: url });
            return { url };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload cover image: ' + error.message);
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getOwnProfile", null);
__decorate([
    (0, common_1.Get)('check-username'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "checkUsername", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('profile/update'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfileInfo", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('upload-avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('upload-cover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadCover", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        cloudinary_service_1.CloudinaryService])
], UsersController);
//# sourceMappingURL=users.controller.js.map