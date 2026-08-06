"use client";

import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from "@mui/material";

interface PokemonSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export default function PokemonSearchBar({
  value,
  onChange,
  isLoading = false,
}: Readonly<PokemonSearchBarProps>) {
  return (
    <TextField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search Pokemon by name"
      size="small"
      variant="outlined"
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
            </InputAdornment>
          ),
        },
      }}
      helperText={isLoading ? "Searching Pokemon..." : "Type part of a name, e.g. char"}
      sx={{
        maxWidth: 440,
        mb: 2,
        "& .MuiOutlinedInput-root": {
          color: "#e2e8f0",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          "& fieldset": {
            borderColor: "rgba(148, 163, 184, 0.35)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(226, 232, 240, 0.75)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#f8fafc",
          },
        },
        "& .MuiFormHelperText-root": {
          color: "#94a3b8",
          marginLeft: 0,
        },
      }}
    />
  );
}
