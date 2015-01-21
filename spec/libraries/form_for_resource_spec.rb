require 'rails_helper'

describe 'form_for resource', type: :view do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    it 'does not allow :url to be used with :resource' do
      expect do
        form_for(build(:course), resource: :course, url: courses_path) {}
      end.to raise_error(ArgumentError)
    end

    context 'when the resource is new' do
      subject { form_for(build(:course), resource: :course) {} }
      it 'generates the plural route' do
        expect(subject).to have_form(courses_path, :post)
      end
    end

    context 'when the resource is persisted' do
      let(:course) { create(:course) }
      subject { form_for(course, resource: :course) {} }
      it 'generates the singular route' do
        expect(subject).to have_form(course_path(course), :post)
      end
    end
  end
end
