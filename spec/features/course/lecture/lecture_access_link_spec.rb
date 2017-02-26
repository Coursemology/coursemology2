# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Lectures', js: true do
  let!(:instance) { create(:instance, :with_lecture_component_enabled) }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_lecture_component_enabled) }
    let!(:valid_lecture) do
      create(:course_lecture, course: course)
    end

    let!(:not_started_lecture) do
      create :course_lecture, :not_started, course: course
    end

    let!(:ended_lecture) do
      create :course_lecture, :ended, course: course
    end

    let!(:instructor_link) do
      "https://lecture_link_#{valid_lecture.id}.com"
    end

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'Can generate link for active lecture' do
        visit course_lectures_path(course)
        valid_lecture_eid = lecture_eid valid_lecture
        expect(page).not_to have_selector(lecture_eid(ended_lecture))
        expect(page).not_to have_selector(lecture_eid(not_started_lecture))
        expect(page).to have_selector(valid_lecture_eid)
        page.find(valid_lecture_eid).click
        wait_for_ajax
        expect(page).to have_selector("#lec-link-#{valid_lecture.id}")
        valid_lecture.reload
        expect(valid_lecture.instructor_classroom_link).to be_truthy
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'Can generate link for active lecture' do
        visit course_lectures_path(course)
        valid_lecture_eid = lecture_eid valid_lecture
        # W/O instructor_classroom_link, learner cannot generate link
        expect(page).not_to have_selector(valid_lecture_eid)
        valid_lecture.update! instructor_classroom_link: instructor_link
        # learner should be able to generate link now
        visit course_lectures_path(course)
        page.find(valid_lecture_eid).click
        wait_for_ajax
        expect(page).to have_selector("#lec-link-#{valid_lecture.id}")
        valid_lecture.reload
        # Make sure link remains as instructor link
        expect(valid_lecture.instructor_classroom_link).to eq(instructor_link)
      end
    end
  end

  def lecture_eid(lecture)
    "#lec-#{lecture.course.id}-#{lecture.id}"
  end
end
