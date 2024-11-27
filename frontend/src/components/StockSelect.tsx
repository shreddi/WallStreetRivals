import { useState } from 'react'
import { Stock } from '../types'
import { Combobox, InputBase, useCombobox, Group, CheckIcon, } from '@mantine/core'

interface StockSelectProps {
  stocks: Stock[];
  setSelectedStock: (selectedStock: Stock | undefined) => void;
}

export default function StockSelect({ stocks, setSelectedStock }: StockSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const shouldFilterOptions = stocks.every((stock) => stock.ticker !== search);
  const filteredOptions: Stock[] = shouldFilterOptions
    ? stocks.filter((stock) => stock.ticker.toLowerCase().includes(search.toLowerCase().trim()))
    : stocks

  const options = filteredOptions.map((stock) => (
    <Combobox.Option value={stock.ticker} key={stock.id}>
      <Group gap="xs">
        {stock.ticker === value && <CheckIcon size={12} />}
        <span>{stock.ticker}- ${stock.trade_price}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        setValue(val);
        setSearch(val);
        setSelectedStock(stocks.find((stock) => stock.ticker === val))
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          rightSection={<Combobox.Chevron />}
          value={search}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(value || '');
          }}
          rightSectionPointerEvents="none"
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
