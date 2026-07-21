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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const messages_service_1 = require("./messages.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const path_1 = require("path");
const multer = __importStar(require("multer"));
const fs = __importStar(require("fs"));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/messages';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + (0, path_1.extname)(file.originalname));
    }
});
let MessagesController = class MessagesController {
    messagesService;
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    async getRecentChats(req) {
        return this.messagesService.getRecentChats(req.user.userId);
    }
    async getConversation(req, otherUserId, limit, offset) {
        const lim = limit ? parseInt(limit, 10) : 30;
        const off = offset ? parseInt(offset, 10) : 0;
        return this.messagesService.getConversation(req.user.userId, otherUserId, lim, off);
    }
    async markAsRead(req, senderId) {
        await this.messagesService.markAsRead(req.user.userId, senderId);
        return { success: true };
    }
    async uploadMessageFile(req, receiverId, messageType, tempId, file) {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        const fileUrl = `/uploads/messages/${file.filename}`;
        return this.messagesService.createMessage({
            senderId: req.user.userId,
            receiverId,
            messageType,
            tempId,
            fileUrl,
            fileName: file.originalname
        });
    }
    async getSharedMedia(req, otherUserId, types) {
        return this.messagesService.getSharedMedia(req.user.userId, otherUserId, types);
    }
    async deleteConversation(req, otherUserId) {
        await this.messagesService.deleteConversation(req.user.userId, otherUserId);
        return { success: true };
    }
    async deleteMessage(req, id) {
        await this.messagesService.deleteMessage(req.user.userId, id);
        return { success: true };
    }
    async getChatSettings(req, otherUserId) {
        return this.messagesService.getChatSettings(req.user.userId, otherUserId);
    }
    async updateChatSettings(req, otherUserId, body) {
        return this.messagesService.updateChatSettings(req.user.userId, otherUserId, body);
    }
    async blockUser(req, otherUserId) {
        await this.messagesService.blockUser(req.user.userId, otherUserId, false);
        return { success: true };
    }
    async unblockUser(req, otherUserId) {
        await this.messagesService.unblockUser(req.user.userId, otherUserId);
        return { success: true };
    }
    async restrictUser(req, otherUserId) {
        await this.messagesService.blockUser(req.user.userId, otherUserId, true);
        return { success: true };
    }
    async unrestrictUser(req, otherUserId) {
        await this.messagesService.unblockUser(req.user.userId, otherUserId);
        return { success: true };
    }
    async searchMessages(req, otherUserId, query) {
        if (!query)
            return [];
        return this.messagesService.searchMessages(req.user.userId, otherUserId, query);
    }
    async togglePinMessage(req, messageId) {
        return this.messagesService.togglePinMessage(req.user.userId, messageId);
    }
    async getPinnedMessages(req, otherUserId) {
        return this.messagesService.getPinnedMessages(req.user.userId, otherUserId);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('chats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getRecentChats", null);
__decorate([
    (0, common_1.Get)('conversation/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Patch)('read/:senderId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('senderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('receiverId')),
    __param(2, (0, common_1.Body)('messageType')),
    __param(3, (0, common_1.Body)('tempId')),
    __param(4, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "uploadMessageFile", null);
__decorate([
    (0, common_1.Get)('shared-media/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __param(2, (0, common_1.Query)('types')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getSharedMedia", null);
__decorate([
    (0, common_1.Delete)('conversation/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Get)('settings/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getChatSettings", null);
__decorate([
    (0, common_1.Patch)('settings/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "updateChatSettings", null);
__decorate([
    (0, common_1.Post)('block/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Delete)('block/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.Post)('restrict/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "restrictUser", null);
__decorate([
    (0, common_1.Delete)('restrict/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "unrestrictUser", null);
__decorate([
    (0, common_1.Get)('search/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __param(2, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "searchMessages", null);
__decorate([
    (0, common_1.Patch)('pin/:messageId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "togglePinMessage", null);
__decorate([
    (0, common_1.Get)('pinned/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getPinnedMessages", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map