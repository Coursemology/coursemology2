require 'rails_helper'

RSpec.describe Course::GroupsController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:course) { create(:course, creator: admin) }
    let(:group) { create(:course_group, course: course) }
    before { sign_in(admin) }

    describe '#update' do
      context 'when the user is present' do
        let(:user_to_add) { create(:user) }
        let(:group_attributes) do
          id_not_taken = generate(:nested_attribute_new_id)
          group_users_attributes = { id_not_taken => attributes_for(:course_group_user,
                                                                    user_id: user_to_add) }
          attributes_for(:course_group, group_users_attributes: group_users_attributes)
        end
        subject { patch :update, course_id: course, id: group, group: group_attributes }

        context 'when the user and the group are in the same course' do
          let!(:course_user) { create(:course_user, course: course, user: user_to_add) }

          it 'adds the user to the group' do
            expect { subject }.to change { group.users.count }.by(1)
          end

          it 'sets the proper flash message' do
            subject
            expect(flash[:success]).to eq(I18n.t('course.groups.update.success'))
          end
        end

        context 'when the user and the group are in different courses' do
          it 'does not add the user to group' do
            expect { subject }.not_to change { group.users.count }
          end

          it { is_expected.to render_template(:edit) }
        end
      end

      context 'when the user is blank' do
        let(:group_attributes) do
          id_not_taken = generate(:nested_attribute_new_id)
          group_users_attributes = { id_not_taken => attributes_for(:course_group_user) }
          attributes_for(:course_group, group_users_attributes: group_users_attributes)
        end
        subject { patch :update, course_id: course, id: group, group: group_attributes }

        it 'does not add the user to the group' do
          expect { subject }.to change { group.users.count }.by(0)
        end

        it { is_expected.to redirect_to(course_groups_path(course)) }
      end
    end
  end
end
