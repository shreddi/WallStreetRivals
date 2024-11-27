import { useState } from 'react'
import { Stock } from '../types'
import { Combobox, InputBase, Input, useCombobox, Group, CheckIcon, CloseButton, Select, ScrollArea} from '@mantine/core'

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

  const handleSelect = (selection: string | undefined) => {
    if (selection) {
      setValue(selection);
      setSearch(selection);
      setSelectedStock(stocks.find((stock) => stock.ticker === selection));
      combobox.closeDropdown()
    } else {
      setValue(null)
      setSearch('')
      setSelectedStock(undefined)
      combobox.closeDropdown()
    }
  }

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        handleSelect(val)
      }}
    >
      <Combobox.Target>
        <InputBase
          rightSection={
            value !== null ? (
              <CloseButton
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  handleSelect(undefined)
                }}
                aria-label="Clear value"
              />
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionPointerEvents={value === null ? 'none' : 'all'}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
        // onKeyDown={(event) => {
        //   if (event.key === 'Enter' && options.length == 1) {
        //     event.preventDefault();
        //     handleSelect(options[0].value)
        //   }
        // }}
        />
      </Combobox.Target>

      <Combobox.Dropdown >
        <Combobox.Options>
          <ScrollArea.Autosize mah={200} type="scroll">
            {options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : options}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox >
  );
}
