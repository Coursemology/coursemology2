# frozen_string_literal: true
class Course::LearningMapController < Course::ComponentController
  STARTING_DEPTH = 0
  ROOT_ID = -1

  add_breadcrumb :index, :course_learning_map_path

  def index
    count = 0
    conditionals = []
    Course::Condition.conditionals_for(current_course).each { |conditional|
      count += 1
      conditional.id = count
      conditionals.append(conditional)
    }

    user_satisfiability_graph = Course::Conditional::UserSatisfiabilityGraph.new(conditionals)

    root = { id: ROOT_ID, title: current_course.title, unlocked: true, children_ids: Set.new }
    @nodes = [root]

    conditionals.each { |conditional|
      root[:children_ids].add(conditional.id) if conditional.conditions.empty?

      unlocked = conditional.conditions_satisfied_by?(current_course_user)
      children_ids = user_satisfiability_graph.instance_variable_get(:@edges)[conditional].map { |edge|
        edge.conditional_id
      }.to_set

      node = conditional.attributes.merge({ unlocked: unlocked, children_ids: children_ids }).symbolize_keys
      @nodes.append(node)
    }

    generate_node_depths(root, STARTING_DEPTH, Set.new)

    respond_to do |format|
      format.html
      format.json do
        render json: @nodes
      end
    end
  end

  # @return [Course::LearningMapComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_learning_map_component]
  end

  private

  def generate_node_depths(node, depth, visited_node_ids)
    visited_node_ids.add(node[:id])
    node.merge!({ depth: depth })

    @nodes.each { |child_node|
      if node[:children_ids].include?(child_node[:id]) && !visited_node_ids.include?(child_node[:id])
        generate_node_depths(child_node, depth + 1, visited_node_ids)
      end
    }
  end

  def conditional_object?(object)
    object.singleton_class.include?(ActiveRecord::Base::ConditionalInstanceMethods)
  end
end
