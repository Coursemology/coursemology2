# frozen_string_literal: true
json.threadId @thread_id
json.threadStatus @thread_status
json.sentMessages 0
json.maxMessages current_course.codaveri_max_get_help_user_messages if current_course.codaveri_get_help_usage_limited?
