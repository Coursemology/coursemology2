# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Users: Sign Up' do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    context 'As an unregistered user' do
      scenario 'I can register for an account' do
        visit new_user_registration_path

        expect do
          click_button I18n.t('user.registrations.new.sign_up')
        end.not_to change(User, :count)
        expect(page).to have_selector('div.has-error')

        valid_user = attributes_for(:user).reverse_merge(email: generate(:email))
        fill_in 'user_name', with: valid_user[:name]
        fill_in 'user_email', with: valid_user[:email]
        fill_in 'user_password', with: valid_user[:password]
        fill_in 'user_password_confirmation', with: valid_user[:password]

        expect do
          click_button I18n.t('user.registrations.new.sign_up')
        end.to change(User, :count).by(1)
        user = User::Email.find_by!(email: valid_user[:email]).user_id
        expect(instance.users.exists?(user)).to be_truthy
      end
    end

    context 'As a user invited by course staffs' do
      let(:course) { create(:course) }
      let(:invitation) { create(:course_user_invitation, :phantom, course: course) }
      let(:invited_email) { invitation.email }

      scenario 'I can register for an account' do
        visit new_user_registration_path(invitation: invitation.invitation_key)

        invited_user = attributes_for(:user)
        fill_in 'user_password', with: invited_user[:password]
        fill_in 'user_password_confirmation', with: invited_user[:password]

        expect do
          click_button I18n.t('user.registrations.new.sign_up')
        end.to change(course.users, :count).by(1)

        email = User::Email.find_by(email: invited_email)
        user = email.user
        course_user = CourseUser.where(user: user, course: course).first
        expect(email).to be_primary
        expect(email).to be_confirmed
        expect(invitation.reload).to be_confirmed
        expect(invitation.confirmer).to eq(email.user)
        expect(course_user).to be_phantom
      end

      context 'when the invitation code is confirmed' do
        let(:invitation) { create(:course_user_invitation, :confirmed, course: course) }

        scenario 'I am redirected with an error' do
          visit new_user_registration_path(invitation: invitation.invitation_key)

          expect(current_path).to eq(root_path)
          expect(page).to have_selector('div.alert', text: I18n.t('user.registrations.new.used_with_email'))
        end
      end
    end

    context 'As a user invited by course staffs to multiple courses' do
      let(:course1) { create(:course) }
      let(:course2) { create(:course) }
      let!(:invitation1) { create(:course_user_invitation, :phantom, name: 'course1_user', course: course1) }
      let!(:invitation2) do
        create(:course_user_invitation, name: 'course2_user', email: invitation1.email, course: course2)
      end
      let(:invited_email) { invitation1.email }

      scenario 'I can register for an account via the registration links' do
        visit new_user_registration_path(invitation: invitation1.invitation_key)

        invited_user = attributes_for(:user)
        fill_in 'user_password', with: invited_user[:password]
        fill_in 'user_password_confirmation', with: invited_user[:password]

        expect do
          click_button I18n.t('user.registrations.new.sign_up')
        end.to change(course1.users, :count).by(1).
          and change(course2.users, :count).by(1)

        email = User::Email.find_by(email: invited_email)
        user = email.user
        first_course_user = CourseUser.where(user: user, course: course1).first
        second_course_user = CourseUser.where(user: user, course: course2).first

        expect(email).to be_primary
        expect(email).to be_confirmed
        expect(invitation1.reload).to be_confirmed
        expect(invitation1.confirmer).to eq(email.user)
        expect(first_course_user.name).to eq(invitation1.name)
        expect(first_course_user).to be_phantom

        expect(invitation2.reload).to be_confirmed
        expect(invitation2.confirmer).to eq(email.user)
        expect(second_course_user.name).to eq(invitation2.name)
        expect(second_course_user).not_to be_phantom
      end

      scenario 'I can register for an account without using the registration link' do
        visit new_user_registration_path

        valid_user = attributes_for(:user).reverse_merge(email: invitation1.email)
        fill_in 'user_name', with: valid_user[:name]
        fill_in 'user_email', with: valid_user[:email]
        fill_in 'user_password', with: valid_user[:password]
        fill_in 'user_password_confirmation', with: valid_user[:password]

        expect do
          click_button I18n.t('user.registrations.new.sign_up')
          confirm_registartion_token_via_email
        end.to change(course1.users, :count).by(1).
          and change(course2.users, :count).by(1)

        email = User::Email.find_by(email: invited_email)
        user = email.user
        first_course_user = CourseUser.where(user: user, course: course1).first
        second_course_user = CourseUser.where(user: user, course: course2).first

        expect(email).to be_primary
        expect(email).to be_confirmed
        expect(invitation1.reload).to be_confirmed
        expect(invitation1.confirmer).to eq(email.user)
        expect(first_course_user.name).to eq(invitation1.name)
        expect(first_course_user).to be_phantom

        expect(invitation2.reload).to be_confirmed
        expect(invitation2.confirmer).to eq(email.user)
        expect(second_course_user.name).to eq(invitation2.name)
        expect(second_course_user).not_to be_phantom
      end
    end
  end
end
