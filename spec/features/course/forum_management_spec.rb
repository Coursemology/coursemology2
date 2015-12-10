require 'rails_helper'

RSpec.feature 'Course: Forum: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }
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

        find_link(nil, href: course_forum_path(course, forum)).click
        expect(current_path).to eq(course_forums_path(course))

        expect(page).not_to have_selector("#forum_#{forum.id}")
      end

      scenario 'I can subscribe to a forum' do
        forum = create(:forum, course: course)
        visit course_forum_path(course, forum)
        find_link(I18n.t('course.forum.forums.subscribe.tag'),
                  href: subscribe_course_forum_path(course, forum)).click

        expect(current_path).to eq(course_forum_path(course, forum))
        expect(page).to have_link(I18n.t('course.forum.forums.unsubscribe.tag'),
                                  unsubscribe_course_forum_path(course, forum))
        expect(Course::Forum::Subscription.where(user: user, forum: forum).count).to eq(1)
      end

      scenario 'I can unsubscribe from a forum' do
        forum = create(:forum, course: course)
        Course::Forum::Subscription.create(forum: forum, user: user)
        visit course_forum_path(course, forum)
        find_link(I18n.t('course.forum.forums.unsubscribe.tag'),
                  href: unsubscribe_course_forum_path(course, forum)).click

        expect(current_path).to eq(course_forum_path(course, forum))
        expect(page).to have_link(I18n.t('course.forum.forums.subscribe.tag'),
                                  subscribe_course_forum_path(course, forum))
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }
      scenario 'I can see forums' do
        forums = create_list(:forum, 2, course: course)
        visit course_forums_path(course)
        forums.each do |forum|
          expect(page).to have_link(forum.name, href: course_forum_path(course, forum))
          expect(page).to have_content_tag_for(forum)
        end
      end

      scenario 'I can subscribe to a forum' do
        forum = create(:forum, course: course)
        visit course_forum_path(course, forum)
        find_link(I18n.t('course.forum.forums.subscribe.tag'),
                  href: subscribe_course_forum_path(course, forum)).click

        expect(current_path).to eq(course_forum_path(course, forum))
        expect(page).to have_link(I18n.t('course.forum.forums.unsubscribe.tag'),
                                  unsubscribe_course_forum_path(course, forum))
        expect(Course::Forum::Subscription.where(user: user, forum: forum).count).to eq(1)
      end

      scenario 'I can unsubscribe from a forum' do
        forum = create(:forum, course: course)
        Course::Forum::Subscription.create(forum: forum, user: user)
        visit course_forum_path(course, forum)
        find_link(I18n.t('course.forum.forums.unsubscribe.tag'),
                  href: unsubscribe_course_forum_path(course, forum)).click

        expect(current_path).to eq(course_forum_path(course, forum))
        expect(page).to have_link(I18n.t('course.forum.forums.subscribe.tag'),
                                  subscribe_course_forum_path(course, forum))
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)
      end
    end
  end
end
