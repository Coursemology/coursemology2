module Course::Discussion::Post::OrderingConcern
  extend ActiveSupport::Concern

  # Sorts all posts in a collection in topographical order.
  #
  # By convention, each post is represented by an array. The first element is the post itself,
  # the second is the children of the array.
  class PostSort
    include Enumerable
    delegate :each, to: :@sorted

    # Constructor.
    #
    # @param [Array<Course::Discussion::Post>] posts The posts to sort.
    def initialize(posts)
      @posts = posts
      @sorted = sort(nil)
    end

    private

    def sort(post_id)
      children_posts = @posts.select { |child_post| child_post.parent_id == post_id }
      children_posts.map do |child_post|
        [child_post].push(sort(child_post.id))
      end
    end
  end

  module ScopeMethods
    # Returns a set of recursive arrays indicating the parent-child relationships of posts.
    #
    # @return [Enumerable]
    def ordered_topologically
      PostSort.new(self)
    end
  end

  included do
    scope :ordered_topologically, (lambda do
      ScopeMethods.instance_method(:ordered_topologically).bind(current_scope).call
    end)
  end
end
