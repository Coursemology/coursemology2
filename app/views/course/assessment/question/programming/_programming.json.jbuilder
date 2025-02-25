# frozen_string_literal: true
json.language question.language.name
json.editorMode question.language.ace_mode
json.fileSubmission question.multiple_file_submission

json.memoryLimit question.memory_limit if question.memory_limit
json.timeLimit question.time_limit if question.time_limit
json.attemptLimit question.attempt_limit if question.attempt_limit

json.fileSubmission question.multiple_file_submission?

json.autogradable question.auto_gradable?

json.isCodaveri question.is_codaveri?
json.liveFeedbackEnabled question.live_feedback_enabled?
