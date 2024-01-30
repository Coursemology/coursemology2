# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Topics: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_teaching_assistant) { create(:course_teaching_assistant, course: course) }
    let(:course_student1) { create(:course_student, course: course) }
    let(:course_student2) { create(:course_student, course: course) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:submission1) { create(:submission, :submitted, assessment: assessment, creator: course_student1.user) }
    let(:submission2) { create(:submission, :submitted, assessment: assessment, creator: course_student2.user) }
    let(:answer1) { submission1.answers.first }
    let(:answer2) { submission2.answers.first }
    let(:file1) { answer1.actable.files.first }
    let(:file2) { answer2.actable.files.first }
    let(:comment) do
      create(:course_assessment_submission_question, :with_post, course: course)
    end
    let(:code_annotation) do
      create(:course_assessment_answer_programming_file_annotation, :with_post, file: file1, course: course)
    end
    let(:video_comment) do
      create(:course_video_topic, :with_post, :with_submission, course: course, timestamp: 3723)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { course_teaching_assistant.user }

      scenario 'I can see all the comments' do
        comment
        code_annotation
        video_comment
        visit course_topics_path(course)
        expect(page).to have_selector('button#all_tab')
        find('button#all_tab').click
        expect(page).to have_selector('div', text: comment.submission.assessment.title)
        expect(page).
          to have_selector('div', text: code_annotation.file.answer.submission.assessment.title)
        expect(page).to have_selector(
          "#topic-#{video_comment.discussion_topic.id}-#{Time.at(video_comment.timestamp).utc.strftime('%H-%M-%S')}",
          text: video_comment.video.title
        )
      end

      scenario 'I can reply to a comment topic' do
        # Randomly create a topic, either code_annotation, comment, or video_comment.
        choices = [proc { code_annotation }, proc { comment }, proc { video_comment }]
        topic = choices.sample[]
        visit course_topics_path(course)

        expect(page).to have_selector('button#all_tab')
        find('button#all_tab').click

        comment = 'GOOD WORK!'

        within find("div#comment-field-#{topic.discussion_topic.id}") do
          fill_in_react_ck 'textarea', comment
        end

        find("button#comment-submit-#{topic.discussion_topic.id}").click

        post = topic.posts.reload.last

        within find("div#post_#{post.id}") do
          expect(page).to have_tag('*', text: comment)
        end
      end

      scenario 'I can mark a topic as pending' do
        choices = [proc { code_annotation }, proc { comment }, proc { video_comment }]
        topic = choices.sample[].acting_as
        visit course_topics_path(course)

        expect(page).to have_selector('button#all_tab')
        find('button#all_tab').click

        find("a#unmark-as-pending-#{topic.id}").click
        expect(topic.reload).not_to be_pending_staff_reply

        find("a#mark-as-pending-#{topic.id}").click
        expect(topic.reload).to be_pending_staff_reply
      end
    end

    context 'As a Course Student' do
      let(:user) { course_student2.user }
      let(:student_comment) do
        create(:course_assessment_submission_question,
               course: course,
               user: user,
               posts: [build(:course_discussion_post, creator: user)])
      end
      let(:student_annotation) do
        create(:course_assessment_answer_programming_file_annotation,
               file: file2,
               course: course,
               creator: user,
               posts: [build(:course_discussion_post, creator: user)])
      end
      let(:student_reply) do
        create(:course_discussion_post, topic: student_comment.acting_as, creator: user,
                                        text: '<p>Content with html tags</p>')
      end
      let(:student_video_comment) do
        create(:course_video_topic, :with_submission,
               course: course,
               creator: user,
               posts: [build(:course_discussion_post, creator: user)])
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

        expect(page).to have_selector('button#all_tab')
        find('button#all_tab').click

        expect(page).not_to have_selector('a.clickable')

        other_comments.each do |comment|
          expect(page).not_to have_selector(".topic-#{comment.id}")
        end

        my_comments.each do |comment|
          expect(page).to have_selector(".topic-#{comment.id}")
        end
      end

      scenario 'I can see my pending comments and mark as read' do
        other_comments = [
          staff_response_to_comment, staff_response_to_annotation, staff_response_to_video
        ].map(&:topic)
        mark_as_read = other_comments.sample

        visit course_topics_path(course)

        expect(page).to have_selector('button#unread_tab')
        find('button#unread_tab').click

        other_comments.each { |comment| expect(page).to have_selector(".topic-#{comment.id}") }

        find("a#mark-as-read-#{mark_as_read.id}").click
        wait_for_page

        expect(page).to have_selector('a.clickable', count: other_comments.length - 1)
        expect(mark_as_read.unread?(user)).to be_falsey
      end

      scenario 'I can reply to and delete a comment topic' do
        # Randomly create a topic, either code_annotation, comment, or video_comment.
        choices = [proc { student_annotation },
                   proc { student_comment },
                   proc { student_video_comment }]
        topic = choices.sample[]
        visit course_topics_path(course)

        expect(page).to have_selector('button#all_tab')
        find('button#all_tab').click

        comment = 'THANKS !'
        within find("div#comment-field-#{topic.discussion_topic.id}") do
          fill_in_react_ck 'textarea', comment
        end

        find("button#comment-submit-#{topic.discussion_topic.id}").click

        post = topic.posts.reload.last
        within find("div#post_#{post.id}") do
          expect(page).to have_tag('*', text: comment)
        end

        # Delete post
        find("div#post_#{post.id}").find('.delete-comment').click
        expect(page).to have_selector('.confirm-btn')
        accept_confirm_dialog
        expect(page).not_to have_selector("div#post_#{post.id}")

        # Reply when last post of topic has just been deleted
        reply_text = 'WELCOME (:'
        within find("div#comment-field-#{topic.discussion_topic.id}") do
          fill_in_react_ck 'textarea', reply_text
        end

        find("button#comment-submit-#{topic.discussion_topic.id}").click

        post = topic.posts.reload.last
        within find("div#post_#{post.id}") do
          expect(page).to have_tag('*', text: reply_text)
        end
      end

      scenario 'I can edit my comment post' do
        choices = [proc { student_reply }, proc { student_video_reply }]
        my_comment_post = choices.sample[]
        visit course_topics_path(course)

        expect(page).to have_selector('button#all_tab')
        find('button#all_tab').click

        # Test post editing
        old_text = my_comment_post.text
        find("div#post_#{my_comment_post.id}").find('.edit-comment').click
        within find(".edit-discussion-post-form#edit_post_#{my_comment_post.id}") do
          find(".cancel-button#post_#{my_comment_post.id}").click
        end
        # Edit and save should not change the old content
        expect(my_comment_post.reload.text).to eq(old_text)

        new_post_text = 'new post text'
        find("div#post_#{my_comment_post.id}").find('.edit-comment').click
        within find(".edit-discussion-post-form#edit_post_#{my_comment_post.id}") do
          fill_in_react_ck 'textarea', new_post_text
          find(".submit-button#post_#{my_comment_post.id}").click
        end
        expect(page).to have_text(new_post_text)
      end
    end

    context 'As a system administrator' do
      let(:user) { create(:administrator) }

      scenario 'I can visit the comments page' do
        comment
        video_comment
        visit course_topics_path(course)

        expect(page).to have_selector('button#all_tab')
        find('button#all_tab').click
        expect(page).to have_selector('div', text: comment.submission.assessment.title)
        expect(page).to have_selector(
          "#topic-#{video_comment.discussion_topic.id}-#{Time.at(video_comment.timestamp).utc.strftime('%H-%M-%S')}",
          text: video_comment.video.title
        )
      end
    end
  end
end
