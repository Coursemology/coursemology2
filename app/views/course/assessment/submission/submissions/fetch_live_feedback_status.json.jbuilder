# frozen_string_literal: true
json.threadStatus @thread_status
json.sentMessages @thread.sent_user_messages(@thread.submission_creator_id)
json.maxMessages current_course.codaveri_max_get_help_user_messages if current_course.codaveri_get_help_usage_limited?
