# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::GroupsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:course) { create(:course, creator: admin) }
    let(:group) { create(:course_group, course: course) }
    before { sign_in(admin) }

    describe '#update' do
      context 'when the user is present' do
        let(:group_users_attributes) do
          id_not_taken = generate(:nested_attribute_new_id)
          { id_not_taken => attributes_for(:course_group_user,
                                           course_user_id: course_user_to_add.id) }
        end
        let(:group_attributes) do
          attributes_for(:course_group, group_users_attributes: group_users_attributes)
        end
        subject { patch :update, params: { course_id: course, id: group, group: group_attributes } }

        context 'when the user and the group are in the same course' do
          let!(:course_user_to_add) { create(:course_user, course: course) }

          it 'adds the user to the group' do
            expect { subject }.to(change { group.course_users.count }.by(1))
          end

          it 'sets the proper flash message' do
            subject
            expect(flash[:success]).to eq(I18n.t('course.groups.update.success'))
          end
        end

        context 'when the user and the group are in different courses' do
          let(:other_course) { create(:course) }
          let!(:course_user_to_add) { create(:course_user, course: other_course) }

          it 'does not add the user to group' do
            expect { subject }.not_to(change { group.course_users.count })
          end

          it { is_expected.to render_template(:edit) }
        end

        context 'when duplicate users are added' do
          let!(:course_user_to_add) { create(:course_user, course: course) }
          let(:group_users_attributes) do
            first_id = generate(:nested_attribute_new_id)
            second_id = generate(:nested_attribute_new_id)
            {
              first_id => attributes_for(:course_group_user, course_user_id: course_user_to_add),
              second_id => attributes_for(:course_group_user, course_user_id: course_user_to_add)
            }
          end

          it 'adds neither of them to the group' do
            expect { subject }.to change { group.course_users.count }.by(0)
          end
        end
      end

      context 'when the user is blank' do
        let(:group_attributes) do
          id_not_taken = generate(:nested_attribute_new_id)
          group_users_attributes = { id_not_taken => attributes_for(:course_group_user) }
          attributes_for(:course_group, group_users_attributes: group_users_attributes)
        end
        subject { patch :update, params: { course_id: course, id: group, group: group_attributes } }

        it 'does not add the user to the group' do
          expect { subject }.to change { group.course_users.count }.by(0)
        end

        it { is_expected.to redirect_to(course_groups_path(course)) }
      end
    end

    describe '#destroy' do
      let!(:group_stub) do
        stub = create(:course_group, course: course)
        allow(stub).to receive(:destroy).and_return(false)
        stub
      end
      subject { delete :destroy, params: { course_id: course, id: group_stub } }

      context 'when the group cannot be destroyed' do
        before do
          controller.instance_variable_set(:@group, group_stub)
          subject
        end

        it { is_expected.to redirect_to(course_groups_path(course)) }
      end
    end
  end
end
