require 'rails_helper'

RSpec.describe ApplicationHelper, type: :helper do
  describe 'sidebar navigation' do
    it 'defaults to not having a sidebar' do
      expect(helper.has_sidebar?).to eq(false)
    end

    describe '#has_sidebar' do
      it 'sets #has_sidebar?' do
        helper.has_sidebar
        expect(helper.has_sidebar?).to eq(true)
      end
    end

    describe '#sidebar' do
      it 'sets #has_sidebar?' do
        helper.sidebar do
          ''
        end
      end

      it 'accepts a block as the sidebar contents' do
        result = helper.sidebar do
          'Test Contents'
        end
        expect(result).to include('Test Contents')
      end
    end
  end
end
