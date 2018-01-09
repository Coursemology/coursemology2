# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Topics: Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:comment) do
      create(:course_assessment_submission_question, :with_post, course: course)
    end
    let(:code_annotation) do
      create(:course_assessment_answer_programming_file_annotation, :with_post, course: course)
    end
    let(:video_comment) do
      create(:course_video_topic, :with_post, :with_submission, course: course, timestamp: 3723)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I can see all the comments' do
        comment
        code_annotation
        video_comment
        visit course_topics_path(course)

        expect(page).to have_selector('.nav.nav-tabs')
        expect(page).to have_selector('div', text: comment.submission.assessment.title)
        expect(page).
          to have_selector('div', text: code_annotation.file.answer.submission.assessment.title)
        expect(page).
          to have_link(I18n.t(
                                'course.video.topics.discussion_topic_topic.comment_title',
                                title: video_comment.video.title,
                                timestamp: Time.at(video_comment.timestamp).utc.strftime('%H:%M:%S')))
      end

      scenario 'I can reply to a comment topic', js: true do
        # Randomly create a topic, either code_annotation, comment, or video_comment.
        choices = [proc { code_annotation }, proc { comment }, proc { video_comment }]
        topic = choices.sample[]
        visit course_topics_path(course)

        comment = 'GOOD WORK!'
        fill_in_rails_summernote '.post-form', comment
        within find('.post-form') do
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

      scenario 'I can mark a topic as pending', js: true do
        choices = [proc { code_annotation }, proc { comment }, proc { video_comment }]
        topic = choices.sample[].acting_as
        visit course_topics_path(course)

        click_link I18n.t('course.discussion.topics.mark_as_pending')
        wait_for_ajax
        expect(topic.reload).to be_pending_staff_reply

        click_link I18n.t('course.discussion.topics.unmark_as_pending')
        wait_for_ajax
        expect(topic.reload).not_to be_pending_staff_reply
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }
      let(:student_answer) do
        create(:course_assessment_answer, course: course, creator: user)
      end
      let(:student_comment) do
        create(:course_assessment_submission_question, :with_post, course: course, user: user)
      end
      let(:student_annotation) do
        create(:course_assessment_answer_programming_file_annotation, :with_post,
               course: course, creator: user)
      end
      let(:student_reply) do
        create(:course_discussion_post, topic: student_comment.acting_as, creator: user,
                                        text: '<p>Content with html tags</p>')
      end
      let(:student_video_comment) do
        create(:course_video_topic, :with_post, :with_submission, course: course, creator: user)
      end
      let(:student_video_reply) do
        create(:course_discussion_post, topic: student_video_comment.acting_as, creator: user,
                                        text: '<p>Content with html tags</p>')
      end
      let(:staff_response_to_comment) do
        create(:course_discussion_post, topic: student_comment.acting_as, creator: course.creator)
      end
      let(:staff_response_to_annotation) do
        create(:course_discussion_post,
               topic: student_annotation.acting_as, creator: course.creator)
      end
      let(:staff_response_to_video) do
        create(:course_discussion_post,
               topic: student_video_comment.acting_as, creator: course.creator)
      end

      scenario 'I can see all my comments' do
        other_comments = [comment, code_annotation, video_comment].map(&:acting_as)
        my_comments = [student_comment, student_annotation, student_video_comment].map(&:acting_as)
        visit course_topics_path(course)

        expect(page).to have_selector('.nav.nav-tabs')
        expect(page).not_to have_link(I18n.t('course.discussion.topics.mark_as_pending'))

        other_comments.each do |comment|
          expect(page).not_to have_content_tag_for(comment)
        end

        my_comments.each do |comment|
          expect(page).to have_content_tag_for(comment)
        end
      end

      scenario 'I can see my pending comments and mark as read' do
        other_comments = [
          staff_response_to_comment, staff_response_to_annotation, staff_response_to_video
        ].map(&:topic)
        mark_as_read = other_comments.sample

        visit pending_course_topics_path(course)

        expect(page).to have_selector('.nav.nav-tabs')

        other_comments.each { |comment| expect(page).to have_content_tag_for(comment) }

        within find(content_tag_selector(mark_as_read)) do
          click_link I18n.t('course.discussion.topics.mark_as_read')
        end

        expect(page).not_to have_content_tag_for(mark_as_read)
        expect(mark_as_read.unread?(user)).to be_falsey
      end

      scenario 'I can reply to and delete a comment topic', js: true do
        # Randomly create a topic, either code_annotation, comment, or video_comment.
        choices = [proc { student_annotation },
                   proc { student_comment },
                   proc { student_video_comment }]
        topic = choices.sample[]
        visit course_topics_path(course)

        comment = 'THANKS !'
        fill_in_rails_summernote '.post-form', comment
        within find('.post-form') do
          click_button I18n.t('course.discussion.posts.form.comment')
        end
        wait_for_ajax

        post = topic.posts.reload.last
        expect(post.text).to have_tag('*', text: comment)
        expect(page).to have_content_tag_for(post)
        within find(content_tag_selector(topic.acting_as)) do
          expect(page).to have_tag('.post-form', count: 1)
        end

        # Delete post
        find(content_tag_selector(post)).find('.delete').click
        expect(page).to have_selector('.confirm-btn')
        accept_confirm_dialog
        wait_for_ajax
        expect(page).not_to have_content_tag_for(post)

        # Reply when last post of topic has just been deleted
        reply_text = 'WELCOME (:'
        fill_in_rails_summernote '.post-form', reply_text
        within find('.post-form') do
          click_button I18n.t('course.discussion.posts.form.comment')
        end
        wait_for_ajax

        reply = topic.posts.reload.last
        expect(reply.text).to have_tag('*', text: reply_text)
      end

      scenario 'I can edit my comment post', js: true do
        choices = [proc { student_reply }, proc { student_video_reply }]
        my_comment_post = choices.sample[]
        visit course_topics_path(course)

        # Test post editing
        old_text = my_comment_post.text
        find(content_tag_selector(my_comment_post)).find('.edit').click
        within find('.edit-discussion-post-form') do
          click_button I18n.t('javascript.course.discussion.post.submit')
        end
        wait_for_ajax
        # Edit and save should not change the old content
        expect(my_comment_post.reload.text).to eq(old_text)

        new_post_text = 'new post text'
        find(content_tag_selector(my_comment_post)).find('.edit').click
        fill_in_rails_summernote '.edit-discussion-post-form', new_post_text
        within find('.edit-discussion-post-form') do
          click_button I18n.t('javascript.course.discussion.post.submit')
        end
        wait_for_ajax
        expect(page).to have_text(new_post_text)
      end
    end

    context 'As a system administrator' do
      let(:user) { create(:administrator) }

      scenario 'I can visit the comments page' do
        comment
        video_comment
        visit course_topics_path(course)

        expect(page).to have_selector('.nav.nav-tabs')
        expect(page).to have_selector('div', text: comment.submission.assessment.title)
        expect(page).
          to have_link(I18n.t(
                                'course.video.topics.discussion_topic_topic.comment_title',
                                title: video_comment.video.title,
                                timestamp: Time.at(video_comment.timestamp).utc.strftime('%H:%M:%S')))
      end
    end
  end
end
