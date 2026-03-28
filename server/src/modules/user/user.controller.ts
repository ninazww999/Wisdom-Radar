import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('subscriptions')
  async getSubscriptions(@Query('userId') userId: string) {
    console.log('[GET /api/user/subscriptions] params:', { userId });
    
    return {
      subscribedCategories: ['policy', 'industry', 'technology', 'market'],
      notificationEnabled: true,
      subscribedAt: new Date().toISOString()
    };
  }

  @Post('subscriptions')
  async updateSubscriptions(
    @Body() body: { userId: string; categories: string[]; notificationEnabled: boolean }
  ) {
    console.log('[POST /api/user/subscriptions] body:', body);
    
    return {
      success: true,
      message: '订阅设置已更新'
    };
  }

  @Get('history')
  async getReadingHistory(
    @Query('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10'
  ) {
    console.log('[GET /api/user/history] params:', { userId, page, pageSize });
    
    return {
      list: [
        { id: '1', title: '工信部发布具身智能发展指导意见', readTime: '2024-01-15' },
        { id: '2', title: '特斯拉Optimus机器人最新进展', readTime: '2024-01-14' },
        { id: '3', title: '空间计算技术路线图发布', readTime: '2024-01-13' }
      ],
      total: 3
    };
  }

  @Get('bookmarks')
  async getBookmarks(
    @Query('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10'
  ) {
    console.log('[GET /api/user/bookmarks] params:', { userId, page, pageSize });
    
    return {
      list: [
        { 
          id: '1', 
          title: '工信部发布具身智能发展指导意见', 
          source: '工业和信息化部',
          publishTime: '2024-01-15',
          category: 'policy'
        }
      ],
      total: 1
    };
  }
}
