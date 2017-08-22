# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'User: Profile' do
  let(:instance) { Instance.default }
  let(:other_instance) { create(:instance) }

  with_tenant(:instance) do
    let(:student) { create(:user) }
    let(:admin) { create(:administrator) }
    let(:viewed_user) { create(:user) }
    let(:completed_course) { create(:course, start_at: 7.days.ago, end_at: 2.days.ago) }
    let(:current_course) { create(:course) }

    let!(:other_instance_course) do
      ActsAsTenant.with_tenant(other_instance) do
        create(:course_user, user: viewed_user).course
      end
    end

    before do
      create(:course_user, user: viewed_user, course: completed_course)
      create(:course_user, user: viewed_user, course: current_course)
      login_as(user, scope: :user)
      visit user_path(viewed_user)
    end

    context 'As a registered user' do
      let(:user) { student }

      scenario 'I can view another user\'s profile' do
        expect(page).to have_text(completed_course.title)
        expect(page).to have_text(current_course.title)
      end

      scenario 'I cannot see another user\'s related instances' do
        expect(page).not_to have_text(other_instance.name)
        expect(page).not_to have_text(other_instance_course.title)
      end
    end

    context 'As an admin' do
      let(:user) { admin }

      scenario 'I can see another user\'s related instances' do
        expect(page).to have_text(other_instance.name)
      end
    end
  end
end
