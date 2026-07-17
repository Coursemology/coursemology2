# frozen_string_literal: true
# Verified against app/views/course/assessment/question/scribing/_scribing_question.json.jbuilder:
# scribing exposes its image via `attachment_reference.generate_public_url`, guarded by presence.
json.imageUrl question.attachment_reference&.generate_public_url
