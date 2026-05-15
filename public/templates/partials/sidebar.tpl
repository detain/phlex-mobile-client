<aside class="sidebar-widget">
    {if $widget.title}
    <h3 class="widget-title">{$widget.title}</h3>
    {/if}
    <div class="widget-content">
        {block name="widget_content"}{/block}
    </div>
</aside>