module ApplicationHelper
  
  # This is the domain to reference throughout the site.
  #
  def domain_name
    "coroutine.com"
  end
  
  
  # This method formats a file system item as a short string.
  #
  def format_file_system_item_short(fsi)
    return "" unless fsi
    "#{fsi.name}" 
  end
  
  
  # This method formats a file system item as a long string.
  #
  def format_file_system_item_long(fsi)
    return "" unless fsi
    
    children   = fsi.get_total_child_count.to_s
    block_size = fsi.get_total_block_size.to_s
    
    s  = ""
    s += (fsi.type == "directory") ? "d" : "-"
    s += fsi.permission 
    s += " "
    (2 - children.length).times do
      s += "&nbsp;"
    end
    s += children
    s += " "
    s += fsi.owner
    s += " &nbsp;"
    s += fsi.group
    s += " &nbsp;"
    (4 - block_size.length).times do
      s += "&nbsp;"
    end
    s += block_size
    s += " "
    s += fsi.published_at.strftime("%b %d %H:%M")
    s += " "
    s += fsi.name.to_s
  end
  
end
