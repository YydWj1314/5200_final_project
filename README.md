This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Final Project

### GCP connection

- Install Gcloud

```bash
brew install --cask google-cloud-sdk
```

- Login and select project

```sql
gcloud auth login
gcloud config set project db-002088658-472700
```

- 启动后，你就能像连接本地数据库一样连接 Cloud SQL：

```sql
gcloud sql connect neu-test-db --user=root
```

### 本地项目中添加 .env.local 文件

```bash
项目文件夹/
  .env.local      👈 放这里（此文件不会被提交到 git）
  package.json
  next.config.mjs
  src/
  ...
```

**重要：** `.env.local` 文件包含敏感信息（数据库密码、API key），已被 `.gitignore` 忽略，不会被提交到 git 仓库。

文件内容：

```bash
# GCP Cloud SQL 数据库配置
DB_HOST=localhost              # 使用 Cloud SQL Proxy 时填 localhost
DB_PORT=3307                  # Cloud SQL Proxy 端口
DB_USER=your_db_user          # 数据库用户名
DB_PASSWORD=your_db_password  # 数据库密码
DB_NAME=5200_final_project

# OpenAI API Key（可选，用于 AI 查询功能）
# 请从 https://platform.openai.com/api-keys 获取你的 API key
OPENAI_API_KEY=your_openai_api_key_here
```

**提示：** 可以参考 `.env.example` 文件创建你的 `.env.local` 文件。

### run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### sql 相关

建表语句：

```sql
-- 建议先选好数据库：
USE 5200_final_project;

-- 1) 用户表 users（已加入 is_delete / user_avatar / user_profile / 唯一约束）
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_account  VARCHAR(256) NOT NULL,                     -- 账号/邮箱
  user_password VARCHAR(512) NOT NULL,                     -- 密码（hash）
  user_name     VARCHAR(256) NULL,                         -- 昵称
  user_avatar   VARCHAR(512) NULL,                         -- 头像
  user_profile  TEXT NULL,                                 -- 个人简介
  user_role     VARCHAR(256) NOT NULL DEFAULT 'user',      -- user/admin/ban
  is_delete     TINYINT(1) NOT NULL DEFAULT 0,             -- 逻辑删除标记
  edited_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_user_account UNIQUE (user_account)   -- 邮箱唯一
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 如果你确实需要 union_id，可以先加字段再建索引：
-- ALTER TABLE users ADD COLUMN union_id VARCHAR(255);
-- CREATE INDEX idx_users_union_id ON users (union_id);



-- 2) 题库表 question_banks（已加入 topic / picture）
CREATE TABLE IF NOT EXISTS question_banks (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(256) NULL,
  topic       VARCHAR(256) NULL,                           -- 新增：题库主题
  description TEXT NULL,
  picture     VARCHAR(512) NULL,                           -- 新增：封面图
  user_id     BIGINT UNSIGNED NOT NULL,
  edited_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  is_delete   TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_qb_user
    FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_question_banks_title  ON question_banks (title);
CREATE INDEX idx_question_banks_userid ON question_banks (user_id);



-- 3) 题目表 questions（与你现在代码匹配）
CREATE TABLE IF NOT EXISTS questions (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(256) NULL,
  content     TEXT NULL,
  tags        JSON NULL,
  answer      TEXT NULL,
  edited_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  is_delete   TINYINT(1) NOT NULL DEFAULT 0,
  saved_count BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_questions_title ON questions (title);



-- 4) 题库-题目关联表 question_bank_questions
CREATE TABLE IF NOT EXISTS question_bank_questions (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  question_bank_id BIGINT UNSIGNED NOT NULL,
  question_id      BIGINT UNSIGNED NOT NULL,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_qbq_unique UNIQUE (question_bank_id, question_id),
  CONSTRAINT fk_qbq_bank
    FOREIGN KEY (question_bank_id) REFERENCES question_banks(id)
      ON DELETE CASCADE,
  CONSTRAINT fk_qbq_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_qbq_bank ON question_bank_questions (question_bank_id);
CREATE INDEX idx_qbq_qid  ON question_bank_questions (question_id);



-- 5) 用户收藏题目表 user_question_saved
CREATE TABLE IF NOT EXISTS user_question_saved (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_uqs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE,
  CONSTRAINT fk_uqs_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- 6) 用户收藏题库表 user_bank_favorites
CREATE TABLE IF NOT EXISTS user_bank_favorites (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  bank_id    BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ubf_user
    FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE,
  CONSTRAINT fk_ubf_bank
    FOREIGN KEY (bank_id) REFERENCES question_banks(id)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7) user sessions
CREATE TABLE sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  hashed_sid VARCHAR(255) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_hashed_sid (hashed_sid),
  INDEX idx_sessions_expires (expires_at)
);
```
