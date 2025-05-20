# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Post: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let(:topic) { create(:forum_topic, forum: forum, course: course) }
    let(:question_topic) { create(:forum_topic, forum: forum, course: course, topic_type: :question) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      scenario 'I can see posts' do
        posts = create_list(:course_discussion_post, 2, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to have_selector("div.post_#{post.id}")
        end
      end

      scenario 'I can create a post' do
        visit course_forum_topic_path(course, forum, topic)

        find('button.new-post-button').click

        expect do
          fill_in_react_ck 'textarea[name=text]', 'test'
          find('button.btn-submit').click
          expect(page).not_to have_content('Anonymous post')
          expect_toastify('The post has been created.')
        end.to change { topic.reload.posts.count }.by(1)

        expect(topic.reload.posts.last.text).to eq('<p>test</p>')
        expect(topic.reload.subscriptions.where(user: user).count).to eq(1)
      end

      scenario 'I can update my own post' do
        create(:course_discussion_post, topic: topic.acting_as, creator: user)
        topic.reload
        visit course_forum_topic_path(course, forum, topic)
        post = topic.posts.last

        # My own post
        find("button.post-edit-#{post.id}").click

        # Edit with invalid information.
        fill_in_react_ck "textarea[name=postEditText_#{post.id}]", ' '
        find('.save-button').click
        expect_toastify('Post cannot be empty!')

        # Edit with valid information.
        fill_in_react_ck "textarea[name=postEditText_#{post.id}]", 'new_text'
        find('.save-button').click
        expect_toastify('The post has been updated.')

        expect(topic.reload.posts.last.text).to eq('<p>new_text</p>')
        expect(page).to have_selector("div.post_#{topic.posts.last.id}")
        within find("div.post_#{topic.reload.posts.last.id}") do
          expect(page).to have_text('new_text')
        end
      end

      scenario 'I can delete my own post' do
        post = create(:course_discussion_post, topic: topic.acting_as, creator: user)
        visit course_forum_topic_path(course, forum, topic)

        expect do
          find("button.post-delete-#{post.id}").click
          accept_prompt
        end.to change { topic.posts.exists?(post.id) }.to(false)
        expect(page).to have_no_selector("div.post_#{post.id}")

        post = topic.reload.posts.first

        expect do
          find("button.post-delete-#{post.id}").click
          accept_prompt
        end.to change { topic.posts.exists?(post.id) }.to(false)
        expect(page).to have_current_path(course_forum_path(course, forum))
        expect(page).to have_no_selector("tr.topic_#{topic.id}")
        expect(forum.topics.exists?(topic.id)).to eq(false)
      end

      scenario 'I can reply to a post' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        post = topic.posts.reload.sample

        visit course_forum_topic_path(course, forum, topic)

        find("button.post-reply-#{post.id}").click

        # Reply a post with empty content.
        expect(find('.reply-button')).to be_disabled

        expect(page).not_to have_content('Anonymous post')

        # Reply a post with the default title.
        fill_in_react_ck "textarea[name=postReplyText_#{post.id}]", 'test'
        find('.reply-button').click
        expect_toastify('The reply post has been created.')

        expect(topic.reload.posts.last.text).to eq('<p>test</p>')
        expect(topic.reload.posts.last.parent).to eq(post)

        expect(page).to have_selector("div.post_#{topic.posts.last.id}")
        within find("div.post_#{topic.reload.posts.last.id}") do
          expect(page).to have_text('test')
        end
      end

      scenario 'I can vote for a post' do
        post = topic.posts.first
        expect(post).not_to be_nil
        visit course_forum_topic_path(course, forum, topic)

        # Downvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbDownOffAltIcon"]').find(:xpath, '..').click
        end

        wait_for_page
        expect(post.reload.vote_tally).to eq(-1)
        expect(find('div.vote-tally').text).to eq('-1')

        # Un-downvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbDownAltIcon"]').find(:xpath, '..').click
        end

        wait_for_page
        expect(post.reload.vote_tally).to eq(0)
        expect(find('div.vote-tally').text).to eq('0')

        # Upvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbUpOffAltIcon"]').find(:xpath, '..').click
        end

        wait_for_page
        expect(post.reload.vote_tally).to eq(1)
        expect(find('div.vote-tally').text).to eq('1')

        # Un-upvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbUpAltIcon"]').find(:xpath, '..').click
        end

        wait_for_page
        expect(post.reload.vote_tally).to eq(0)
        expect(find('div.vote-tally').text).to eq('0')
      end

      scenario 'I can mark/unmark post as answer' do
        post = create(:course_discussion_post, topic: question_topic.acting_as)
        visit course_forum_topic_path(course, forum, question_topic)
        wait_for_page
        # Mark as answer
        within find("div.post_#{post.id}") do
          click_button 'Mark as answer'
          expect(page).to have_text('Unmark as answer')
        end
        expect(post.reload).to be_answer
        expect(question_topic.reload).to be_resolved
        wait_for_page
        # Unmark as answer
        within find("div.post_#{post.id}") do
          click_button 'Unmark as answer'
          expect(page).to have_text('Mark as answer')
        end
        expect(post.reload).not_to be_answer
        expect(question_topic.reload).not_to be_resolved

        # Mark as answer and then delete the answer
        within find("div.post_#{post.id}") do
          click_button 'Mark as answer'
        end

        find("button.post-delete-#{post.id}").click
        accept_prompt

        wait_for_page
        expect(question_topic.reload).not_to be_resolved
      end

      scenario 'When anonymous post is not allowed and there are anonymous posts, I can see the authors' do
        anonymous_posts = create_list(:course_discussion_post, 2, :anonymous_post, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)

        anonymous_posts.each do |post|
          within find("div.post_#{post.id}") do
            expect(page).to have_text(post.creator.name)
            expect(page).not_to have_text('Anonymous User')
            expect(page).not_to have_button('Unmask User')
          end
        end
      end

      context 'When anonymous post is allowed' do
        before do
          context = OpenStruct.new(current_course: course, key: Course::ForumsComponent.key)
          settings = Course::Settings::ForumsComponent.new(context)
          settings.allow_anonymous_post = true
          course.save
        end

        scenario 'I can unmask and see the authors of anonymous posts' do
          anonymous_posts = create_list(:course_discussion_post, 2, :anonymous_post, topic: topic.acting_as)
          visit course_forum_topic_path(course, forum, topic)

          anonymous_posts.each do |post|
            within find("div.post_#{post.id}") do
              expect(page).not_to have_text(post.creator.name)
              expect(page).to have_text('Anonymous User')
              expect(page).to have_button('Unmask User')

              click_button 'Unmask User'
              expect(page).not_to have_text('Anonymous User')
              expect(page).to have_text(post.creator.name)
              expect(page).to have_button('Mask User')

              click_button 'Mask User'
              expect(page).to have_text('Anonymous User')
              expect(page).not_to have_text(post.creator.name)
            end
          end
        end

        scenario 'I can create an anonymous post and unmask to view my own post author' do
          visit course_forum_topic_path(course, forum, topic)

          find('button.new-post-button').click

          expect do
            fill_in_react_ck 'textarea[name=text]', 'test'
            find_field('isAnonymous', visible: false).set(true)
            find('button.btn-submit').click
            expect_toastify('The post has been created.')
          end.to change { topic.reload.posts.count }.by(1)

          expect(topic.reload.posts.last.text).to eq('<p>test</p>')
          expect(topic.reload.posts.last.is_anonymous).to be_truthy

          within find("div.post_#{topic.posts.last.id}") do
            expect(page).to have_text('Anonymous User')
            expect(page).not_to have_text(course_user.name)
            expect(page).to have_button('Unmask User')

            click_button 'Unmask User'
            expect(page).not_to have_text('Anonymous User')
            expect(page).to have_text(course_user.name)
            expect(page).to have_button('Mask User')

            click_button 'Mask User'
            expect(page).to have_text('Anonymous User')
            expect(page).not_to have_text(course_user.name)
          end
        end
      end
    end

    context 'As a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      scenario 'I can see posts' do
        posts = create_list(:course_discussion_post, 2, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to have_selector("div.post_#{post.id}")
        end
      end

      scenario 'I can create a post' do
        visit course_forum_topic_path(course, forum, topic)

        find('button.new-post-button').click

        expect do
          fill_in_react_ck 'textarea[name=text]', 'test'
          expect(page).not_to have_content('Anonymous post')
          find('button.btn-submit').click
          expect_toastify('The post has been created.')
        end.to change { topic.reload.posts.count }.by(1)

        expect(topic.reload.posts.last.text).to eq('<p>test</p>')
        expect(topic.reload.subscriptions.where(user: user).count).to eq(1)
        within find("div.post_#{topic.posts.last.id}") do
          expect(page).to have_no_selector('svg[data-testId="CheckIcon"]')
        end
      end

      scenario 'I can reply to a post' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        post = topic.posts.reload.sample

        visit course_forum_topic_path(course, forum, topic)

        find("button.post-reply-#{post.id}").click

        expect(page).not_to have_content('Anonymous post')

        fill_in_react_ck "textarea[name=postReplyText_#{post.id}]", 'test'
        find('.reply-button').click
        expect_toastify('The reply post has been created.')

        expect(topic.reload.posts.last.text).to eq('<p>test</p>')
        expect(topic.reload.posts.last.parent).to eq(post)

        expect(page).to have_selector("div.post_#{topic.posts.last.id}")
        within find("div.post_#{topic.reload.posts.last.id}") do
          expect(page).to have_text('test')
        end
      end

      scenario 'I can vote for a post' do
        post = topic.posts.first
        expect(post).not_to be_nil
        visit course_forum_topic_path(course, forum, topic)

        # Downvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbDownOffAltIcon"]').find(:xpath, '..').click
        end

        wait_for_page
        expect(post.reload.vote_tally).to eq(-1)
        expect(find('div.vote-tally').text).to eq('-1')

        # Un-downvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbDownAltIcon"]').find(:xpath, '..').click
        end

        wait_for_page
        expect(post.reload.vote_tally).to eq(0)
        expect(find('div.vote-tally').text).to eq('0')

        # Upvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbUpOffAltIcon"]').find(:xpath, '..').click
        end

        wait_for_page
        expect(post.reload.vote_tally).to eq(1)
        expect(find('div.vote-tally').text).to eq('1')

        # Un-upvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbUpAltIcon"]').find(:xpath, '..').click
        end

        wait_for_page
        expect(post.reload.vote_tally).to eq(0)
        expect(find('div.vote-tally').text).to eq('0')
      end

      scenario 'I can see topics with unread posts' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        post = topic.posts.reload.sample

        reader = create(:course_user, course: course).user

        expect(topic.unread?(reader)).to be_falsy

        visit course_forum_topic_path(course, forum, topic)

        find("button.post-reply-#{post.id}").click

        fill_in_react_ck "textarea[name=postReplyText_#{post.id}]", 'test'
        find('.reply-button').click
        expect_toastify('The reply post has been created.')

        expect(topic.unread?(reader)).to be_truthy
      end

      scenario 'When anonymous post is not allowed and there are anonymous posts, I can see the authors' do
        anonymous_posts = create_list(:course_discussion_post, 2, :anonymous_post, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)

        anonymous_posts.each do |post|
          within find("div.post_#{post.id}") do
            expect(page).to have_text(post.creator.name)
            expect(page).not_to have_text('Anonymous User')
            expect(page).not_to have_button('Unmask User')
          end
        end
      end

      context 'When anonymous post is allowed' do
        before do
          context = OpenStruct.new(current_course: course, key: Course::ForumsComponent.key)
          settings = Course::Settings::ForumsComponent.new(context)
          settings.allow_anonymous_post = true
          course.save
        end

        scenario 'I cannot see the authors of anonymous posts' do
          anonymous_posts = create_list(:course_discussion_post, 2, :anonymous_post, topic: topic.acting_as)
          visit course_forum_topic_path(course, forum, topic)

          anonymous_posts.each do |post|
            within find("div.post_#{post.id}") do
              expect(page).not_to have_text(post.creator.name)
              expect(page).to have_text('Anonymous User')
              expect(page).not_to have_button('Unmask User')
            end
          end
        end

        scenario 'I can create an anonymous post and unmask to view my own post author' do
          visit course_forum_topic_path(course, forum, topic)

          find('button.new-post-button').click

          expect do
            fill_in_react_ck 'textarea[name=text]', 'test'
            find_field('isAnonymous', visible: false).set(true)
            find('button.btn-submit').click
            expect_toastify('The post has been created.')
          end.to change { topic.reload.posts.count }.by(1)

          expect(topic.reload.posts.last.text).to eq('<p>test</p>')
          expect(topic.reload.posts.last.is_anonymous).to be_truthy

          within find("div.post_#{topic.posts.last.id}") do
            expect(page).to have_text('Anonymous User')
            expect(page).not_to have_text(course_user.name)
            expect(page).to have_button('Unmask User')

            click_button 'Unmask User'
            expect(page).not_to have_text('Anonymous User')
            expect(page).to have_text(course_user.name)
            expect(page).to have_button('Mask User')

            click_button 'Mask User'
            expect(page).to have_text('Anonymous User')
            expect(page).not_to have_text(course_user.name)
          end
        end
      end
    end
  end
end
