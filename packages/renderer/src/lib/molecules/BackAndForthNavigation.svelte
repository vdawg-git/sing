<script lang="ts">
  import { useNavigate } from "svelte-navigator"

  import NavButton from "../atoms/NavButton.svelte"

  const navigate = useNavigate()
</script>

<div class="flex gap-4">
  <NavButton direction="left" on:click={() => navigate(-1)} />
  <NavButton direction="right" on:click={() => navigate(1)} />
</div>
