# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Topics: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:answer_comment) do
      create(:course_assessment_answer, :with_post, course: course)
    end
    let(:code_annotation) do
      create(:course_assessment_answer_programming_file_annotation, :with_post, course: course)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:administrator) }

      scenario 'I can see all the comments' do
        answer_comment
        code_annotation
        visit course_topics_path(course)

        expect(page).to have_selector('div', text: answer_comment.question.assessment.title)
        expect(page).
          to have_selector('div', text: code_annotation.file.answer.question.assessment.title)
      end

      scenario 'I can reply to a comment topic', js: true do
        # Randomly create a topic, either code_annotation or answer_comment.
        topic = [true, false].sample ? code_annotation : answer_comment
        visit course_topics_path(course)

        comment = 'GOOD WORK!'
        within find('.post-form') do
          fill_in 'discussion_post[text]', with: comment
          click_button 'course.discussion.posts.form.comment'
        end
        wait_for_ajax

        post = topic.posts.reload.last
        expect(post.text).to have_tag('*', text: comment)
        expect(page).to have_content_tag_for(post)
        within find(content_tag_selector(topic.acting_as)) do
          expect(page).to have_tag('.post-form', count: 1)
        end
      end
    end
  end
end
