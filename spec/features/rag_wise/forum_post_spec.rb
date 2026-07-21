# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: RagWise: Forum: Post', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_rag_wise_component_enabled) }
    let(:forum) { create(:forum, course: course) }
    let(:topic) { create(:forum_topic, forum: forum, course: course) }
    let(:question_topic) { create(:forum_topic, forum: forum, course: course, topic_type: :question) }
    before do
      login_as(user, scope: :user)
      allow_any_instance_of(Course::Discussion::Post).to receive(:rag_auto_answer!)
    end

    # Clicks the nth star on an AI comment's rating card. MUI renders the radio inputs visually hidden behind
    # labels whose `for` ids are generated, so resolve the label from the input's stable name/value.
    def rate_generated_post(post_id, stars)
      input = find("input[name='ai-generated-rating-#{post_id}'][value='#{stars}']", visible: :all)
      find("label[for='#{input[:id]}']").click
    end

    # An AI-generated draft is now finalised through the rating card (rate -> edit -> accept/reject) rather
    # than the old publish / mark-as-answer-and-publish buttons.
    shared_examples 'staff rating AI generated forum posts' do
      scenario 'I see the rating card on an AI generated draft post instead of the old publish flow' do
        create(:course_discussion_post, :draft,
               topic: topic.acting_as, is_ai_generated: true, parent: topic.posts.first, creator: User.system)
        visit course_forum_topic_path(course, forum, topic)
        post = topic.reload.posts.last

        card = find("div.post_#{post.id}")
        expect(card).to have_text('AI Generated Comment')
        expect(card).to have_text('Please rate to continue!')

        # The old draft flow is gone: no publish / mark-as-answer-and-publish buttons, no inline edit button.
        expect(card).to have_no_selector('div.MuiChip-root', text: 'Publish')
        expect(card).to have_no_selector('div.MuiChip-root', text: 'Mark as answer and publish')
        expect(card).to have_no_selector("button.post-edit-#{post.id}")

        # Regenerating is still offered, but disabled while the draft is awaiting a decision.
        expect(card).to have_selector('div.MuiChip-root.Mui-disabled', text: 'Generate reply')
      end

      scenario 'I can rate, edit and publish an AI generated draft post' do
        create(:course_discussion_post, :draft,
               topic: topic.acting_as, is_ai_generated: true, parent: topic.posts.first, creator: User.system)
        visit course_forum_topic_path(course, forum, topic)
        post = topic.reload.posts.last
        expect(page).to have_selector("div.post_#{post.id}")

        # Rating first unlocks editing.
        rate_generated_post(post.id, 4)
        expect(find("div.post_#{post.id}")).to have_text('Please help to improve the comment below!')

        fill_in_react_ck "textarea[name=edit_post_#{post.id}]", 'new_text'
        find("div.post_#{post.id} button.approve-comment").click
        expect_toastify('Successfully published feedback.', dismiss: true)

        expect(post.reload.workflow_state).to eq('published')
        expect(post.text).to eq('<p>new_text</p>')

        # The rating is persisted and the final content snapshotted onto it.
        rating = post.rag_wise_rating
        expect(rating.rating).to eq(4)
        expect(rating.edited_content).to eq('<p>new_text</p>')

        # The post drops out of the rating flow and renders as an ordinary published post.
        within find("div.post_#{post.id}") do
          expect(page).to have_no_text('AI Generated Comment')
          expect(page).to have_no_text('Please help to improve the comment below!')
        end
      end

      scenario 'I can rate, edit and reject an AI generated draft post' do
        create(:course_discussion_post, :draft,
               topic: topic.acting_as, is_ai_generated: true, parent: topic.posts.first, creator: User.system)
        visit course_forum_topic_path(course, forum, topic)
        post = topic.reload.posts.last
        expect(page).to have_selector("div.post_#{post.id}")
        rating_id = post.reload.rag_wise_rating.id

        rate_generated_post(post.id, 2)
        fill_in_react_ck "textarea[name=edit_post_#{post.id}]", 'rejected_text'
        find("div.post_#{post.id} button.reject-comment").click
        accept_confirm_dialog
        expect_toastify('Successfully rejected feedback.', dismiss: true)

        expect(page).to have_no_selector("div.post_#{post.id}")
        expect(Course::Discussion::Post.exists?(post.id)).to eq(false)

        # The rating is retained (detached from the deleted post) with the final edit captured.
        rating = Course::Forum::RagWiseRating.find(rating_id)
        expect(rating.rating).to eq(2)
        expect(rating.post_id).to be_nil
        expect(rating.edited_content).to eq('<p>rejected_text</p>')
      end

      scenario 'I can rate and publish an AI generated draft post in a question topic' do
        create(:course_discussion_post, :draft,
               topic: question_topic.acting_as, is_ai_generated: true,
               parent: question_topic.posts.first, creator: User.system)
        visit course_forum_topic_path(course, forum, question_topic)
        post = question_topic.reload.posts.last
        expect(page).to have_selector("div.post_#{post.id}")

        rate_generated_post(post.id, 5)
        fill_in_react_ck "textarea[name=edit_post_#{post.id}]", 'answer_text'
        find("div.post_#{post.id} button.approve-comment").click
        expect_toastify('Successfully published feedback.', dismiss: true)

        expect(post.reload.workflow_state).to eq('published')
        expect(post.text).to eq('<p>answer_text</p>')
        expect(post.rag_wise_rating.rating).to eq(5)

        # Accepting publishes the comment; marking it as the topic's answer remains a separate action.
        expect(post.answer).to eq(false)
      end
    end

    context 'As a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it_behaves_like 'staff rating AI generated forum posts'

      scenario 'I can see generate reply buttons on all posts except AI generated post with disabled reply button' do
        parent_posts = create_list(:course_discussion_post, 2,
                                   topic: topic.acting_as)
        child_posts = create_list(:course_discussion_post, 2,
                                  topic: topic.acting_as, parent: topic.posts.first)
        ai_generated_child_posts = create_list(:course_discussion_post, 2,
                                               topic: topic.acting_as, parent: topic.posts.first, is_ai_generated: true)
        visit course_forum_topic_path(course, forum, topic)
        parent_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Generate reply')
          expect(actual_post).to_not have_css('div.MuiChip-root.Mui-disabled')
        end

        child_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Generate reply')
          expect(actual_post).to_not have_css('div.MuiChip-root.Mui-disabled')
        end

        ai_generated_child_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Generate reply')
          expect(actual_post).to have_css('div.MuiChip-root.Mui-disabled')
        end
      end

      scenario 'I can click on generate reply button' do
        topic_post = topic.posts.first
        visit course_forum_topic_path(course, forum, topic)

        generate_reply_button = find("div.post_#{topic_post.id}").find('div.MuiChip-root', text: 'Generate reply')

        expect_any_instance_of(Course::Discussion::Post).to receive(:rag_auto_answer!).once
        generate_reply_button.click
        wait_for_page
      end

      scenario 'I cannot trigger automatic response by posting new post' do
        visit course_forum_topic_path(course, forum, topic)
        topic_post = topic.posts.first

        find("button.post-reply-#{topic_post.id}").click

        # Reply a post with the default title.
        fill_in_react_ck "textarea[name=postReplyText_#{topic_post.id}]", 'test'
        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('.reply-button').click
        wait_for_page
      end
    end

    context 'As a teaching staff' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it_behaves_like 'staff rating AI generated forum posts'

      scenario 'I can see generate reply buttons on all posts except AI generated post with disabled reply button' do
        parent_posts = create_list(:course_discussion_post, 2,
                                   topic: topic.acting_as)
        child_posts = create_list(:course_discussion_post, 2,
                                  topic: topic.acting_as, parent: topic.posts.first)
        ai_generated_child_posts = create_list(:course_discussion_post, 2,
                                               topic: topic.acting_as, parent: topic.posts.first, is_ai_generated: true)
        visit course_forum_topic_path(course, forum, topic)
        parent_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Generate reply')
          expect(actual_post).to_not have_css('div.MuiChip-root.Mui-disabled')
        end

        child_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Generate reply')
          expect(actual_post).to_not have_css('div.MuiChip-root.Mui-disabled')
        end

        ai_generated_child_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Generate reply')
          expect(actual_post).to have_css('div.MuiChip-root.Mui-disabled')
        end
      end

      scenario 'I can click on generate reply button' do
        topic_post = topic.posts.first
        visit course_forum_topic_path(course, forum, topic)

        generate_reply_button = find("div.post_#{topic_post.id}").find('div.MuiChip-root', text: 'Generate reply')
        expect_any_instance_of(Course::Discussion::Post).to receive(:rag_auto_answer!).once
        generate_reply_button.click
        wait_for_page
      end

      scenario 'I cannot trigger automatic response by posting new post' do
        visit course_forum_topic_path(course, forum, topic)
        topic_post = topic.posts.first

        find("button.post-reply-#{topic_post.id}").click

        # Reply a post with the default title.
        fill_in_react_ck "textarea[name=postReplyText_#{topic_post.id}]", 'test'
        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('.reply-button').click
        wait_for_page
      end
    end

    context 'As a course student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      scenario 'I cannot see drafted AI Generated forum response' do
        posts = create_list(:course_discussion_post, 2, :draft,
                            topic: topic.acting_as, is_ai_generated: true, parent: topic.posts.first)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to_not have_selector("div.post_#{post.id}")
        end
      end

      scenario 'I cannot see generate new reply button' do
        visit course_forum_topic_path(course, forum, topic)
        topic_post = topic.posts.first
        expect(topic_post).to_not have_selector('div.MuiChip-root', text: 'Generate reply')
      end

      scenario 'I can trigger automatic response by posting new post' do
        visit course_forum_topic_path(course, forum, topic)
        topic_post = topic.posts.first

        find("button.post-reply-#{topic_post.id}").click

        # Reply a post with the default title.
        fill_in_react_ck "textarea[name=postReplyText_#{topic_post.id}]", 'test'
        expect_any_instance_of(Course::Discussion::Post).to receive(:rag_auto_answer!).once
        find('.reply-button').click
        wait_for_page
      end
    end
  end
end
