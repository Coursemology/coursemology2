# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::ActivitiesController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let(:normal_user) { create(:user) }

    describe '#statistics' do
      subject { get :statistics, params: params, as: :json }
      let(:params) { { granularity: 'month', year: Time.current.year } }
      # The earliest mark sets the first year that can be requested. The suite does not clean up between runs, so this
      # mark is reused rather than recreated, and nothing else in the suite writes marks this early.
      let(:first_year) { 2000 }

      before do
        Course::ActivityMark.find_or_create_by!(course_id: 0, month: Date.new(first_year, 1, 1), user_id: 0,
                                                instance_id: instance.id)
      end

      context 'when a system administrator requests statistics' do
        before { controller_sign_in(controller, admin) }

        it 'renders them, cached privately by the browser for an hour' do
          expect(subject).to render_template(:statistics)
          expect(response).to have_http_status(:ok)
          expect(response.headers['Cache-Control']).to include('private', "max-age=#{1.hour.to_i}")
        end

        context 'for a past year' do
          let(:params) { { granularity: 'month', year: Time.current.year - 1 } }

          it 'lets the browser keep them for a day' do
            subject
            expect(response.headers['Cache-Control']).to include('private', "max-age=#{1.day.to_i}")
          end
        end

        context 'for the yearly view, which includes the current year' do
          let(:params) { { granularity: 'year' } }

          it 'lets the browser keep them for an hour' do
            subject
            expect(response.headers['Cache-Control']).to include('private', "max-age=#{1.hour.to_i}")
          end
        end

        context 'when a student is active in two instances in the same month' do
          render_views
          # Fresh instances and users, so that marks left by earlier runs cannot reach these counts.
          let(:instance_a) { create(:instance) }
          let(:instance_b) { create(:instance) }
          let(:shared_student) { create(:user) }
          let(:other_student) { create(:user) }
          let(:month) { Date.new(first_year, 1, 1) }
          let(:params) { { granularity: 'month', year: first_year } }

          before do
            # One course per instance; the course id only needs to differ between instances.
            [[instance_a, shared_student], [instance_b, shared_student], [instance_a, other_student]].each do |marked|
              Course::ActivityMark.create!(course_id: marked[0].id, month: month, instance_id: marked[0].id,
                                           user_id: marked[1].id)
            end
          end

          it 'counts them once in each instance and once overall' do
            subject
            json = JSON.parse(response.body)
            counts = json['instances'].to_h { |row| [row['id'], row['counts'].first] }

            expect(json['firstYear']).to eq(first_year)
            expect(counts[instance_a.id]).to eq(2)
            expect(counts[instance_b.id]).to eq(1)
            # Overall spans every instance, so earlier runs' marks for this month are in it too.
            expect(json['overall'].first).to eq(Course::ActivityMark.where(month: month).distinct.count(:user_id))
            expect(json['previousOverall']).to be_nil
          end
        end

        context 'with a year before the earliest mark' do
          let(:params) { { granularity: 'month', year: first_year - 1 } }

          it 'returns a 400 error' do
            subject
            expect(response).to have_http_status(:bad_request)
          end
        end

        context 'with an unknown granularity' do
          let(:params) { { granularity: 'week' } }

          it 'returns a 400 error' do
            subject
            expect(response).to have_http_status(:bad_request)
          end
        end
      end

      context 'when an instance administrator requests statistics' do
        before { controller_sign_in(controller, instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a normal user requests statistics' do
        before { controller_sign_in(controller, normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
