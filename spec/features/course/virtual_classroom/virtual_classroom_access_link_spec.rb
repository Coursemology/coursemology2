# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: VirtualClassrooms', js: true do
  let!(:instance) { create(:instance, :with_virtual_classroom_component_enabled) }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_virtual_classroom_component_enabled) }
    let!(:valid_virtual_classroom) do
      create(:course_virtual_classroom, course: course)
    end

    let!(:not_started_virtual_classroom) do
      create :course_virtual_classroom, :not_started, course: course
    end

    let!(:ended_virtual_classroom) do
      create :course_virtual_classroom, :ended, course: course
    end

    let!(:instructor_link) do
      "https://virtual_classroom_link_#{valid_virtual_classroom.id}.com"
    end

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      pending 'Can generate link for active virtual_classroom' do
        visit course_virtual_classrooms_path(course)
        valid_virtual_classroom_eid = virtual_classroom_eid valid_virtual_classroom
        expect(page).not_to have_selector(virtual_classroom_eid(ended_virtual_classroom))
        expect(page).not_to have_selector(virtual_classroom_eid(not_started_virtual_classroom))
        expect(page).to have_selector(valid_virtual_classroom_eid)
        page.find(valid_virtual_classroom_eid).click
        wait_for_ajax
        expect(page).to have_selector("#lec-link-#{valid_virtual_classroom.id}")
        valid_virtual_classroom.reload
        expect(valid_virtual_classroom.instructor_classroom_link).to be_truthy
      end

      pending 'I can fetch recorded videos if they exist' do
        visit course_virtual_classrooms_path(course)
        page.find("#lec-#{course.id}-#{ended_virtual_classroom.id}-list").click
        wait_for_ajax
        expect(page).to have_selector('.recorded-video-link')
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }

      pending 'Can generate link for active virtual_classroom' do
        visit course_virtual_classrooms_path(course)
        valid_virtual_classroom_eid = virtual_classroom_eid valid_virtual_classroom
        # W/O instructor_classroom_link, learner cannot generate link
        expect(page).not_to have_selector(valid_virtual_classroom_eid)
        valid_virtual_classroom.update! instructor_classroom_link: instructor_link
        # learner should be able to generate link now
        visit course_virtual_classrooms_path(course)
        page.find(valid_virtual_classroom_eid).click
        wait_for_ajax
        expect(page).to have_selector("#lec-link-#{valid_virtual_classroom.id}")
        valid_virtual_classroom.reload
        # Make sure link remains as instructor link
        expect(valid_virtual_classroom.instructor_classroom_link).to eq(instructor_link)
      end

      scenario 'I cannot access recorded videos' do
        visit course_virtual_classrooms_path(course)
        expect(page).not_to have_selector "#lec-#{course.id}-#{ended_virtual_classroom.id}-list"
      end
    end
  end

  def virtual_classroom_eid(virtual_classroom)
    "#lec-#{virtual_classroom.course.id}-#{virtual_classroom.id}"
  end
end
