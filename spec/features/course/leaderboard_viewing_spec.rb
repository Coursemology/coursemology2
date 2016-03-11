require 'rails_helper'

RSpec.describe 'Course: Leaderboard: View' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before do
      login_as(user, scope: :user)
    end

    context 'As a student' do
      let(:user) { create(:course_student, :approved, course: course).user }
      scenario 'I can view the leaderboard' do
        visit course_leaderboard_path(course)
      end
    end
  end
end
