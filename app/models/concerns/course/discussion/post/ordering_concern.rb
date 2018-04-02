# frozen_string_literal: true
module Course::Discussion::Post::OrderingConcern
  extend ActiveSupport::Concern

  # Sorts all posts in a collection in topological order.
  #
  # By convention, each post is represented by an array. The first element is the post itself,
  # the second is the children of the array.
  class PostSort
    include Enumerable
    delegate :each, to: :@sorted
    delegate :length, to: :@sorted
    delegate :flatten, to: :@sorted
    alias_method :size, :length

    # Constructor.
    #
    # @param [Array<Course::Discussion::Post>] posts The posts to sort.
    def initialize(posts)
      @posts = posts
      @sorted = sort(nil)
    end

    # Retrieves the last post topologically -- the last post at every branch.
    #
    # @return [Course::Discussion::Post] The last post topologically.
    # @return [nil] When there are no posts.
    def last
      current_thread = @sorted.last
      return nil unless current_thread

      current_thread = current_thread.second.last until current_thread.second.empty?
      current_thread.first
    end

    private

    def sort(post_id)
      children_posts, @posts = @posts.partition { |child_post| child_post.parent_id == post_id }
      children_posts.map do |child_post|
        [child_post].push(sort(child_post.id))
      end
    end
  end

  # Returns a set of recursive arrays indicating the parent-child relationships of posts.
  #
  # @return [Enumerable]
  def ordered_topologically
    PostSort.new(self)
  end
end
