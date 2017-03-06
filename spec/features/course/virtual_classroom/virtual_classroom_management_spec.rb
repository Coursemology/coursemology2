# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: VirtualClassrooms' do
  let!(:instance) { create(:instance, :with_virtual_classroom_component_enabled) }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_virtual_classroom_component_enabled) }
    let!(:not_started_virtual_classroom) do
      create(:course_virtual_classroom, :not_started, course: course)
    end
    let!(:valid_virtual_classroom) { create(:course_virtual_classroom, course: course) }
    let!(:ended_virtual_classroom) { create(:course_virtual_classroom, :ended, course: course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create new virtual_classrooms' do
        visit new_course_virtual_classroom_path(course)

        click_button I18n.t('helpers.submit.virtual_classroom.create')
        expect(page).to have_button(I18n.t('helpers.submit.virtual_classroom.create'))
        expect(page).to have_css('div.has-error')

        virtual_classroom = build_stubbed(:course_virtual_classroom, course: course)
        fill_in 'virtual_classroom_title', with: virtual_classroom.title
        fill_in 'virtual_classroom_content', with: virtual_classroom.content
        fill_in 'virtual_classroom_start_at', with: virtual_classroom.start_at
        fill_in 'virtual_classroom_end_at', with: virtual_classroom.end_at
        expect do
          click_button I18n.t('helpers.submit.virtual_classroom.create')
        end.to change(course.virtual_classrooms, :count).by(1)

        expect(page).to have_selector('div.alert.alert-success',
                                      text: I18n.t('course.virtual_classrooms.create.success'))
        expect(current_path).to eq(course_virtual_classrooms_path(course))
      end

      scenario 'I can edit virtual_classrooms' do
        virtual_classroom = create(:course_virtual_classroom, course: course)
        time_zone = user.time_zone || Application.config.x.default_user_time_zone
        visit edit_course_virtual_classroom_path(course, virtual_classroom)

        expect(page).to have_field('virtual_classroom_title', with: virtual_classroom.title)
        expect(page).to have_field('virtual_classroom_content', with: virtual_classroom.content)
        expect(page).to have_field('virtual_classroom[start_at]',
                                   with: virtual_classroom.start_at.in_time_zone(time_zone))
        expect(page).to have_field('virtual_classroom[end_at]',
                                   with: virtual_classroom.end_at.in_time_zone(time_zone))

        fill_in 'virtual_classroom_title', with: ''
        click_button I18n.t('helpers.submit.virtual_classroom.update')
        expect(page).to have_button('helpers.submit.virtual_classroom.update')
        expect(page).to have_css('div.has-error')

        new_title = 'New Title'
        new_content = 'New content'
        fill_in 'virtual_classroom_title',        with: new_title
        fill_in 'virtual_classroom_content',      with: new_content
        click_button I18n.t('helpers.submit.virtual_classroom.update')

        expect(current_path).to eq course_virtual_classrooms_path(course)
        expect(page).to have_selector('div.alert.alert-success',
                                      text: I18n.t('course.virtual_classrooms.update.success'))
        expect(virtual_classroom.reload.title).to eq(new_title)
        expect(virtual_classroom.reload.content).to eq(new_content)
      end

      scenario 'I can see all existing virtual_classrooms' do
        visit course_virtual_classrooms_path(course)
        expect(page).to have_link(nil, href: new_course_virtual_classroom_path(course))

        [not_started_virtual_classroom,
         valid_virtual_classroom,
         ended_virtual_classroom].each do |virtual_classroom|
          expect(page).to have_content_tag_for(virtual_classroom)
          expect(page).to(
            have_link(nil, href: edit_course_virtual_classroom_path(course, virtual_classroom))
          )
          expect(page).to(
            have_link(nil, href: course_virtual_classroom_path(course, virtual_classroom))
          )
        end
      end

      scenario 'I can delete an existing virtual_classroom' do
        virtual_classroom = create(:course_virtual_classroom, course: course)
        visit course_virtual_classrooms_path(course)

        expect do
          find_link(nil, href: course_virtual_classroom_path(course, virtual_classroom)).click
        end.to change(course.virtual_classrooms, :count).by(-1)
        expect(current_path).to eq(course_virtual_classrooms_path(course))
        expect(page).to have_selector('div.alert.alert-success',
                                      text: I18n.t('course.virtual_classrooms.destroy.success'))
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the VirtualClassroom Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.virtual_classrooms.sidebar_title')
      end

      scenario 'I can see all virtual_classrooms' do
        visit course_virtual_classrooms_path(course)
        expect(page).not_to have_link(nil, href: new_course_virtual_classroom_path(course))

        [not_started_virtual_classroom,
         valid_virtual_classroom,
         ended_virtual_classroom].each do |virtual_classroom|
          expect(page).to have_content_tag_for(virtual_classroom)
          expect(page).
            not_to(
              have_link(nil, href: edit_course_virtual_classroom_path(course, virtual_classroom))
            )
          expect(page).not_to(
            have_link(nil, href: course_virtual_classroom_path(course, virtual_classroom))
          )
        end
      end
    end
  end
end
