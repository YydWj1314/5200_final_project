-- Database Triggers for Integrity Rules
-- Run this script to add triggers that match Slide 8 requirements

USE 5200_final_project;

-- ============================================
-- 1. Add total_questions field to question_banks
-- ============================================
ALTER TABLE question_banks 
ADD COLUMN total_questions BIGINT NOT NULL DEFAULT 0;

-- Initialize total_questions for existing banks
UPDATE question_banks qb
SET total_questions = (
    SELECT COUNT(*)
    FROM question_bank_questions qbq
    WHERE qbq.question_bank_id = qb.id
);

-- ============================================
-- 2. UpdateBankQuestionCount Trigger
-- Automatically updates QuestionBank.total_questions
-- AFTER INSERT on question_bank_questions
-- ============================================
DELIMITER $$

CREATE TRIGGER UpdateBankQuestionCount_Insert
AFTER INSERT ON question_bank_questions
FOR EACH ROW
BEGIN
    UPDATE question_banks
    SET total_questions = total_questions + 1
    WHERE id = NEW.question_bank_id;
END$$

CREATE TRIGGER UpdateBankQuestionCount_Delete
AFTER DELETE ON question_bank_questions
FOR EACH ROW
BEGIN
    UPDATE question_banks
    SET total_questions = GREATEST(total_questions - 1, 0)
    WHERE id = OLD.question_bank_id;
END$$

DELIMITER ;

-- ============================================
-- 3. UpdateQuestionSavedCount Trigger
-- Automatically updates questions.saved_count
-- AFTER INSERT/DELETE on user_question_saved
-- ============================================
DELIMITER $$

CREATE TRIGGER UpdateQuestionSavedCount_Insert
AFTER INSERT ON user_question_saved
FOR EACH ROW
BEGIN
    UPDATE questions
    SET saved_count = saved_count + 1
    WHERE id = NEW.question_id;
END$$

CREATE TRIGGER UpdateQuestionSavedCount_Delete
AFTER DELETE ON user_question_saved
FOR EACH ROW
BEGIN
    UPDATE questions
    SET saved_count = GREATEST(saved_count - 1, 0)
    WHERE id = OLD.question_id;
END$$

DELIMITER ;

-- ============================================
-- 4. PreventDuplicateQuestionSaved Trigger
-- Blocks duplicate (user_id, question_id) attempts
-- BEFORE INSERT on user_question_saved
-- ============================================
DELIMITER $$

CREATE TRIGGER PreventDuplicateQuestionSaved
BEFORE INSERT ON user_question_saved
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM user_question_saved 
        WHERE user_id = NEW.user_id 
          AND question_id = NEW.question_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Duplicate save: User has already saved this question';
    END IF;
END$$

DELIMITER ;

-- ============================================
-- Verification: Show all triggers
-- ============================================
-- SHOW TRIGGERS FROM 5200_final_project;

