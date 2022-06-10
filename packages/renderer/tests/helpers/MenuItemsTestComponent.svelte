<script lang="ts">
  import MenuItem from "@/lib/atoms/MenuItem.svelte"
  import IconRefresh from "virtual:icons/heroicons-outline/refresh"
</script>

<MenuItem>
  <IconRefresh slot="icon" />
  <div slot="label">Label 1</div>
</MenuItem>

<MenuItem>
  <IconRefresh slot="icon" />
  <div slot="label">Label 2</div>
</MenuItem>

<MenuItem>
  <IconRefresh slot="icon" />
  <div slot="label">Label 3</div>
</MenuItem>
