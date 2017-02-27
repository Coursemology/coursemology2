# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Lectures' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:not_started_lecture) { create(:course_lecture, :not_started, course: course) }
    let!(:valid_lecture) { create(:course_lecture, course: course) }
    let!(:ended_lecture) { create(:course_lecture, :ended, course: course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As an Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create new lectures' do
        visit new_course_lecture_path(course)

        click_button I18n.t('helpers.submit.lecture.create')
        expect(page).to have_button(I18n.t('helpers.submit.lecture.create'))
        expect(page).to have_css('div.has-error')

        lecture = build_stubbed(:course_lecture, course: course)
        fill_in 'lecture_title',    with: lecture.title
        fill_in 'lecture_content',  with: lecture.content
        fill_in 'lecture_start_at',  with: lecture.start_at
        fill_in 'lecture_end_at',  with: lecture.end_at
        expect do
          click_button I18n.t('helpers.submit.lecture.create')
        end.to change(course.lectures, :count).by(1)

        expect(page).to have_selector('div.alert.alert-success',
                                      text: I18n.t('course.lectures.create.success'))
        expect(current_path).to eq(course_lectures_path(course))
      end

      scenario 'I can edit lectures' do
        lecture = create(:course_lecture, course: course)
        time_zone = user.time_zone || Application.config.x.default_user_time_zone
        visit edit_course_lecture_path(course, lecture)

        expect(page).to have_field('lecture_title', with: lecture.title)
        expect(page).to have_field('lecture_content', with: lecture.content)
        expect(page).to have_field('lecture[start_at]',
                                   with: lecture.start_at.in_time_zone(time_zone))
        expect(page).to have_field('lecture[end_at]',
                                   with: lecture.end_at.in_time_zone(time_zone))

        fill_in 'lecture_title', with: ''
        click_button I18n.t('helpers.submit.lecture.update')
        expect(page).to have_button('helpers.submit.lecture.update')
        expect(page).to have_css('div.has-error')

        new_title = 'New Title'
        new_content = 'New content'
        fill_in 'lecture_title',        with: new_title
        fill_in 'lecture_content',      with: new_content
        click_button I18n.t('helpers.submit.lecture.update')

        expect(current_path).to eq course_lectures_path(course)
        expect(page).to have_selector('div.alert.alert-success',
                                      text: I18n.t('course.lectures.update.success'))
        expect(lecture.reload.title).to eq(new_title)
        expect(lecture.reload.content).to eq(new_content)
      end

      scenario 'I can see all existing lectures' do
        visit course_lectures_path(course)
        expect(page).to have_link(nil, href: new_course_lecture_path(course))

        [not_started_lecture, valid_lecture, ended_lecture].each do |lecture|
          expect(page).to have_content_tag_for(lecture)
          expect(page).to have_link(nil, href: edit_course_lecture_path(course, lecture))
          expect(page).to have_link(nil, href: course_lecture_path(course, lecture))
        end
      end

      scenario 'I can delete an existing lecture' do
        lecture = create(:course_lecture, course: course)
        visit course_lectures_path(course)

        expect do
          find_link(nil, href: course_lecture_path(course, lecture)).click
        end.to change(course.lectures, :count).by(-1)
        expect(current_path).to eq(course_lectures_path(course))
        expect(page).to have_selector('div.alert.alert-success',
                                      text: I18n.t('course.lectures.destroy.success'))
      end
    end

    context 'As an Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Lecture Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.lectures.sidebar_title')
      end

      scenario 'I can see all lectures' do
        visit course_lectures_path(course)
        expect(page).not_to have_link(nil, href: new_course_lecture_path(course))

        [not_started_lecture, valid_lecture, ended_lecture].each do |lecture|
          expect(page).to have_content_tag_for(lecture)
          expect(page).
            not_to have_link(nil, href: edit_course_lecture_path(course, lecture))
          expect(page).not_to have_link(nil, href: course_lecture_path(course, lecture))
        end
      end
    end
  end
end