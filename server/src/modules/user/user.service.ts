import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async getSubscriptions(userId: string) {
    return {
      subscribedCategories: [],
      notificationEnabled: false
    };
  }

  async updateSubscriptions(userId: string, categories: string[], notificationEnabled: boolean) {
    return { success: true };
  }

  async getReadingHistory(userId: string, page: number, pageSize: number) {
    return {
      list: [],
      total: 0
    };
  }

  async getBookmarks(userId: string, page: number, pageSize: number) {
    return {
      list: [],
      total: 0
    };
  }
}
