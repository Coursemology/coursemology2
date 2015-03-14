require 'rails_helper'

RSpec.describe ApplicationHelper, type: :helper do
  describe 'sidebar navigation' do
    it 'defaults to not having a sidebar' do
      expect(helper.has_sidebar?).to eq(false)
    end

    describe '#sidebar!' do
      it 'sets #has_sidebar?' do
        helper.sidebar!
        expect(helper.has_sidebar?).to eq(true)
      end
    end

    describe '#sidebar' do
      it 'sets #has_sidebar?' do
        helper.sidebar do
          ''
        end
        expect(helper.has_sidebar?).to eq(true)
      end

      it 'accepts a block as the sidebar contents' do
        result = helper.sidebar do
          'Test Contents'
        end
        expect(result).to include('Test Contents')
      end
    end
  end

  describe 'user display helper' do
    describe '#display_user' do
      let(:user) { build(:user) }
      subject { helper.display_user(user) }

      it 'displays the user\'s name' do
        expect(subject).to eq(user.name)
      end
    end

    describe '#link_to_user' do
      let(:user) { build(:user) }
      subject { helper.link_to_user(user) }

      it { is_expected.to have_tag('a') }

      context 'when no block is given' do
        it { is_expected.to include(helper.display_user(user)) }
      end

      context 'when a block is given' do
        subject do
          helper.link_to_user(user) do
            'Test'
          end
        end

        it { is_expected.to include('Test') }
      end
    end
  end
end
