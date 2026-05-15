<div class="media-card" data-id="{$item.id}" data-type="{$item.type}">
    <a href="/library/item/{$item.id}">
        <div class="card-poster">
            {if $item.metadata.poster_url}
                <img src="{$item.metadata.poster_url}" alt="{$item.name}" loading="lazy">
            {else}
                <div class="poster-placeholder">
                    <span class="icon">🎬</span>
                </div>
            {/if}

            {if $item.user_data.resume_position_ticks > 0}
            <div class="progress-bar">
                <div class="progress" style="width: {($item.user_data.resume_position_ticks / $item.metadata.runtime_ticks * 100)|round}%"></div>
            </div>
            {/if}
        </div>
        <div class="card-info">
            <h3 class="card-title">{$item.name}</h3>
            {if $item.metadata.year}
                <span class="card-year">{$item.metadata.year}</span>
            {/if}
        </div>
    </a>
</div>