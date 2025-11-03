# Cookie SameSite 问题解决方案

## 问题描述

浏览器控制台出现警告：
```
尝试通过Set-Cookie 标头设置 Cookie 时被阻止,因为它具有"SameSite=Lax"属性,
但来自跨站点响应,而不是对顶级导航的响应。
```

这会导致：
- Cookie 无法被设置
- 用户无法保持登录状态
- 出现 "未经授权的操作！" 错误

## 解决方案

### 方案一：使用 Vite 代理（推荐 - 已配置）

**已完成配置：**
1. ✅ `vite.config.ts` 中添加了代理配置
2. ✅ `src/api/http.ts` 中已更新为使用相对路径

**优势：**
- 前端和后端通过同一个域名访问（同源）
- 不会触发 SameSite 限制
- 开发体验更好

**使用方法：**
- 确保后端运行在 `http://127.0.0.1:8082`
- 前端运行在 `http://localhost:3000`
- 重启前端开发服务器，代理会自动生效

### 方案二：后端配置 Cookie SameSite（如果必须使用跨域）

如果需要在生产环境使用跨域（前后端不同域名），需要在后端配置 Cookie：

#### 1. 修改 `SecurityConfiguration.java`

在 `rememberMe` 配置中添加 Cookie 设置：

```java
http.rememberMe(rememberMe -> rememberMe
    .key("idontthinkucanezlyguessedithahaha")
    .tokenValiditySeconds(60 * 60 * 24 * 7)
    .rememberMeParameter("remember-me")
    .userDetailsService(userDetailsServiceImpl)
    .cookieName("remember-me")
    .alwaysRemember(false)
);
```

#### 2. 创建 Cookie 配置类

创建 `CookieConfig.java`：

```java
package com.example.web.filmforum.Config.Security;

import org.springframework.boot.web.servlet.server.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CookieConfig {
    
    @Bean
    public CookieSameSiteSupplier cookieSameSiteSupplier() {
        return CookieSameSiteSupplier.ofNone().whenHasName("JSESSIONID")
            .and().whenHasName("remember-me");
    }
}
```

#### 3. 修改 `application.yml`

添加 Cookie 配置：

```yaml
server:
  port: 8082
  servlet:
    session:
      cookie:
        same-site: none
        secure: true  # HTTPS 时必须为 true
        http-only: true
```

**注意：**
- `SameSite=None` 需要 `Secure=true`（HTTPS）
- 在 HTTP 环境下，浏览器不允许 `SameSite=None` 和 `Secure=false` 的组合
- 本地开发建议使用方案一（Vite 代理）

### 方案三：后端添加 `/api/actor/**` 到允许列表

如果演员搜索接口应该是公开的（不需要登录），在 `SecurityConfiguration.java` 中添加：

```java
.requestMatchers("/api/actor/**").permitAll()
```

这样可以避免未登录用户访问时的认证问题。

## 当前状态

✅ **前端已配置 Vite 代理** - 推荐使用此方案
✅ **前端错误处理已优化** - 会显示具体的错误信息

## 验证步骤

1. 重启前端开发服务器（让 Vite 代理生效）
2. 清除浏览器 Cookie
3. 尝试登录或访问演员搜索接口
4. 检查浏览器控制台是否还有 Cookie 警告

## 常见问题

**Q: 为什么使用代理？**
A: 因为浏览器对跨域 Cookie 的 SameSite 限制。通过代理，前后端变为同源，避免这个问题。

**Q: 生产环境怎么办？**
A: 生产环境应该：
- 前后端部署在同一域名下（通过反向代理）
- 或配置 `SameSite=None; Secure`（需要 HTTPS）

**Q: 仍然看到错误？**
A: 检查：
1. 后端是否允许 `/api/actor/**` 访问（如果应该是公开的）
2. Vite 开发服务器是否已重启
3. 浏览器是否清除了旧 Cookie

