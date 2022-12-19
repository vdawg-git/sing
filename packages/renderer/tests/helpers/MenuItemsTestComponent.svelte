<script lang="ts">
  import IconRefresh from "virtual:icons/heroicons/refresh"

  import MenuItem from "@/lib/atoms/MenuItem.svelte"
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
