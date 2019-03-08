# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      scenario 'I can see forums' do
        forums = create_list(:forum, 2, course: course)
        visit course_forums_path(course)
        forums.each do |forum|
          expect(page).to have_link(forum.name, href: course_forum_path(course, forum))
          expect(page).to have_content_tag_for(forum)
        end
      end

      scenario 'I can create a new forum' do
        forum = build_stubbed(:forum)

        visit course_forums_path(course)
        find_link(nil, href: new_course_forum_path(course)).click

        expect(current_path).to eq(new_course_forum_path(course))

        # Create a forum with a missing name.
        fill_in 'forum_description', with: forum.description

        click_button 'submit'

        expect(current_path).to eq(course_forums_path(course))
        expect(page).to have_selector('div.alert.alert-danger')
        expect(page).to have_field('forum_description', with: forum.description)

        # Create a forum with a name.
        fill_in 'forum_name', with: forum.name
        click_button 'submit'

        expect(page).to have_content_tag_for(course.forums.last)
      end

      scenario 'I can edit a forum' do
        forum = create(:forum, course: course)

        # Edit with valid information.
        visit course_forum_path(course, forum)
        find_link(nil, href: edit_course_forum_path(course, forum)).click

        new_name = 'new name'
        fill_in 'forum_name', with: new_name
        click_button 'submit'

        expect(current_path).to eq(course_forum_path(course, forum.reload))
        expect(page).to have_selector('h1', text: new_name)

        # Edit with invalid information.
        visit course_forum_path(course, forum)
        find_link(nil, href: edit_course_forum_path(course, forum)).click

        fill_in 'forum_name', with: ''
        click_button 'submit'

        expect(current_path).to eq(course_forum_path(course, forum.reload))
        expect(page).to have_selector('div.alert.alert-danger')
      end

      scenario 'I can delete a forum' do
        forum = create(:forum, course: course)
        visit course_forum_path(course, forum)

        within find(:css, '.page-header') do
          expect { find(:css, 'a.delete').click }.to \
            change { course.forums.exists?(forum.id) }.to(false)
        end
        expect(current_path).to eq(course_forums_path(course))

        expect(page).to have_no_content_tag_for(forum)
      end

      scenario 'I can subscribe and unsubscribe to a forum ', js: true do
        forum = create(:forum, course: course)

        # Subscribe and unsubscribe at the specific forum page
        visit course_forum_path(course, forum)
        find_link(nil, href: subscribe_course_forum_path(course, forum)).click
        wait_for_ajax

        expect(Course::Forum::Subscription.where(user: user, forum: forum).count).to eq(1)
        expect(page).to have_selector('div.alert.alert-success')

        find_link(nil, href: unsubscribe_course_forum_path(course, forum)).click
        wait_for_ajax

        expect(page).to have_link(nil, href: subscribe_course_forum_path(course, forum))
        expect(page).to have_selector('div.alert.alert-success')
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)

        # Subscribe and unsubscribe at the course forums page
        visit course_forums_path(course)
        find_link(nil, href: subscribe_course_forum_path(course, forum)).click
        wait_for_ajax

        expect(Course::Forum::Subscription.where(user: user, forum: forum).count).to eq(1)
        expect(page).to have_selector('div.alert.alert-success')

        find_link(nil, href: unsubscribe_course_forum_path(course, forum)).click
        wait_for_ajax

        expect(page).to have_link(nil, href: subscribe_course_forum_path(course, forum))
        expect(page).to have_selector('div.alert.alert-success')
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }
      scenario 'I can see forums' do
        forums = create_list(:forum, 2, course: course)
        visit course_forums_path(course)
        forums.each do |forum|
          expect(page).to have_link(forum.name, href: course_forum_path(course, forum))
          expect(page).to have_content_tag_for(forum)
        end
      end

      scenario 'I can subscribe and unsubscribe to a forum ', js: true do
        forum = create(:forum, course: course)

        # Subscribe and unsubscribe at the specific forum page
        visit course_forum_path(course, forum)
        find_link(nil, href: subscribe_course_forum_path(course, forum)).click
        wait_for_ajax

        expect(Course::Forum::Subscription.where(user: user, forum: forum).count).to eq(1)
        expect(page).to have_selector('div.alert.alert-success')

        find_link(nil, href: unsubscribe_course_forum_path(course, forum)).click
        wait_for_ajax

        expect(page).to have_link(nil, href: subscribe_course_forum_path(course, forum))
        expect(page).to have_selector('div.alert.alert-success')
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)

        # Subscribe and unsubscribe at the course forums page
        visit course_forums_path(course)
        find_link(nil, href: subscribe_course_forum_path(course, forum)).click
        wait_for_ajax

        expect(Course::Forum::Subscription.where(user: user, forum: forum).count).to eq(1)
        expect(page).to have_selector('div.alert.alert-success')

        find_link(nil, href: unsubscribe_course_forum_path(course, forum)).click
        wait_for_ajax

        expect(page).to have_link(nil, href: subscribe_course_forum_path(course, forum))
        expect(page).to have_selector('div.alert.alert-success')
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)
      end

      scenario 'I can click unsubscribe forum link from an email' do
        forum = create(:forum, course: course)
        forum.subscriptions.create(user: user)
        visit unsubscribe_course_forum_path(course, forum)
        expect(current_path).to eq(course_forum_path(course, forum))
        expect(page).to have_selector('div.alert.alert-success')
        expect(page).to have_link(nil, href: subscribe_course_forum_path(course, forum))
        expect(page).to have_text(I18n.t('course.forum.forums.unsubscribe.success'))
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)
      end

      scenario 'I can mark all forum topics in the course as read' do
        forum1 = create(:forum, course: course)
        forum2 = create(:forum, course: course)
        topics = create_list(:forum_topic, 2, forum: forum1) +
                 create_list(:forum_topic, 2, forum: forum2)

        expect(topics.all? { |t| t.unread?(user) }).to be_truthy

        visit course_forums_path(course)
        find_link(I18n.t('course.forum.forums.index.mark_all_as_read'),
                  href: mark_all_as_read_course_forums_path(course)).click

        expect(current_path).to eq(course_forums_path(course))
        expect(topics.all? { |t| t.unread?(user) }).to be_falsy
      end

      scenario 'I can mark topics in the forum as read' do
        forum = create(:forum, course: course)
        topics = create_list(:forum_topic, 2, forum: forum)
        expect(topics.all? { |t| t.unread?(user) }).to be_truthy

        visit course_forum_path(course, forum)
        find_link(I18n.t('course.forum.forums.controls.mark_as_read'),
                  href: mark_as_read_course_forum_path(course, forum)).click

        expect(current_path).to eq(course_forum_path(course, forum))
        expect(topics.all? { |t| t.unread?(user) }).to be_falsy
      end

      scenario 'I can go to next unread topic' do
        forum = create(:forum, course: course)
        topic = create(:forum_topic, forum: forum)
        visit course_forum_path(course, forum)
        find_link(I18n.t('course.forum.forums.next_unread.title'),
                  href: next_unread_course_forums_path(course)).click

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_selector('div', text: topic.title)
      end
    end
  end
end
