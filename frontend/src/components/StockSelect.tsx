import { useState } from 'react'
import { Stock } from '../types'
import { Combobox, InputBase, useCombobox, Group, CheckIcon, Space, Flex, CloseButton, ScrollArea, Loader, Text } from '@mantine/core'
import { stockApi } from '../apiService';


interface StockSelectProps {
  setSelectedStock: (selectedStock: Stock | undefined) => void;
}

export default function StockSelect({ setSelectedStock }: StockSelectProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const limit = 100;

  const getAllStocks = async () => {
    setLoading(true)
    stockApi.getAllStocks().then((data) => {
      setStocks(data); //sort stocks alphabetically in local langauge
    }).catch((error: Error) => {
      console.error(error);
    }).finally(() => {
      setLoading(false)
    })
  }

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      if (stocks.length === 0) {
        getAllStocks()
      }
    },
  });

  function getFilteredOptions() {
    const result: Stock[] = [];

    for (let i = 0; i < stocks.length; i += 1) {
      if (result.length === limit) {
        break;
      }

      let stock: Stock = stocks[i]
      if (stock.ticker === 'ACGL') {
        stock.name = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      }
      // const stockString = stocks[i].ticker + stocks[i].name

      if (stock.ticker.toLowerCase().includes(search.trim().toLowerCase())) {
        result.unshift(stocks[i]);
      } else if (stock.name.toLowerCase().includes(search.trim().toLowerCase())) {
        result.push(stocks[i]);
      }
    }

    return result;
  }

  const filteredOptions: Stock[] = getFilteredOptions()

  const options = filteredOptions.map((stock) => (
    <Combobox.Option value={stock.ticker} key={stock.id}>
      <Flex justify="space-between" align='center' >
        <Text fz='sm'>
          {stock.ticker}
        </Text>
        <Text fz="xs" ta='center' c="gray" truncate='end' w='75%'>
          {stock.name}
        </Text>
        <Text fz='sm'>
          ${stock.trade_price}
        </Text>
      </Flex>
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
        handleSelect(val);
      }}
    >
      <Combobox.Target>
        <InputBase
          rightSection={
            loading ? (
              <Loader size={18} color='gray' />
            ) : value !== null ? (
              <CloseButton
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  handleSelect(undefined);
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
            if (event.currentTarget.value.trim()) {
              combobox.openDropdown();
            } else {
              combobox.closeDropdown();
            }
          }}
          onClick={() => {
            if (search.trim()) {
              combobox.openDropdown();
            }
          }}
          onFocus={() => {
            if (search.trim()) {
              combobox.openDropdown();
            }
          }}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize mah={200} type="scroll">
            {loading ? (
              <Combobox.Empty>Loading....</Combobox.Empty>
            ) : options.length === 0 ? (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            ) : (
              options
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
