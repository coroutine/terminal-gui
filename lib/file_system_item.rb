class FileSystemItem
  
  attr_reader   :name, :type, :permission, :owner, :group, :block_size, :published_at, :parent, :children
  attr_accessor :parent
  
  # We'll initialize the MenuItem with a name, url, controller name and a
  # collection of action names
  def initialize(name, type, block_size, published_at)
    @name             = name
    @type             = type
    @permission       = "rwxr-xr-x"
    @owner            = "root"
    @group            = "coroutine"
    @block_size       = block_size
    @published_at     = published_at
    @parent           = nil
    @children         = []
  end
  
  # This function is used to add a child item to the current item
  def add_child(child)
    child.parent = self
    @children << child
    self
  end
  
  def total_child_count
    i = 1
    @children.each do |child|
      i += child.total_child_count
    end
    i
  end
  
  def total_block_size
    i = @block_size
    @children.each do |child|
      i += child.total_block_size
    end
    i
  end
  
end