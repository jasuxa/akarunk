#!/usr/bin/env python3
"""
Реалізація алгоритмів сортування
Автор: Навчальний курс з алгоритмів
"""

import time
import random
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation


class SortingAlgorithms:
    """Клас з реалізаціями різних алгоритмів сортування"""
    
    @staticmethod
    def bubble_sort(arr, visualize=False):
        """Бульбашкове сортування"""
        n = len(arr)
        comparisons = 0
        swaps = 0
        
        for i in range(n):
            swapped = False
            for j in range(0, n-i-1):
                comparisons += 1
                if arr[j] > arr[j+1]:
                    arr[j], arr[j+1] = arr[j+1], arr[j]
                    swaps += 1
                    swapped = True
                    
                    if visualize:
                        yield arr.copy(), j, j+1
            
            if not swapped:
                break
        
        return arr, comparisons, swaps
    
    @staticmethod
    def selection_sort(arr, visualize=False):
        """Сортування вибором"""
        n = len(arr)
        comparisons = 0
        swaps = 0
        
        for i in range(n):
            min_idx = i
            for j in range(i+1, n):
                comparisons += 1
                if arr[j] < arr[min_idx]:
                    min_idx = j
                    
                if visualize:
                    yield arr.copy(), i, j
            
            if min_idx != i:
                arr[i], arr[min_idx] = arr[min_idx], arr[i]
                swaps += 1
        
        return arr, comparisons, swaps
    
    @staticmethod
    def merge_sort(arr):
        """Сортування злиттям"""
        if len(arr) <= 1:
            return arr
        
        mid = len(arr) // 2
        left = SortingAlgorithms.merge_sort(arr[:mid])
        right = SortingAlgorithms.merge_sort(arr[mid:])
        
        return SortingAlgorithms._merge(left, right)
    
    @staticmethod
    def _merge(left, right):
        """Допоміжна функція для злиття двох відсортованих масивів"""
        result = []
        i = j = 0
        
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        
        result.extend(left[i:])
        result.extend(right[j:])
        return result


class SortingVisualizer:
    """Клас для візуалізації алгоритмів сортування"""
    
    def __init__(self, algorithm_name, array_size=20):
        self.algorithm_name = algorithm_name
        self.array_size = array_size
        self.array = list(range(1, array_size + 1))
        random.shuffle(self.array)
        self.original_array = self.array.copy()
        
    def visualize(self):
        """Створює анімацію процесу сортування"""
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.set_title(f'{self.algorithm_name} - Візуалізація')
        
        bar_rects = ax.bar(range(len(self.array)), self.array, align='edge')
        
        # Налаштування осей
        ax.set_xlim(-0.6, len(self.array) - 0.4)
        ax.set_ylim(0, max(self.array) * 1.1)
        ax.set_xlabel('Індекс')
        ax.set_ylabel('Значення')
        
        # Текст для відображення статистики
        text = ax.text(0.02, 0.95, '', transform=ax.transAxes)
        
        iteration = [0]
        
        def update_plot(frame, rects, iteration):
            """Оновлює графік для кожного кадру анімації"""
            if frame is None:
                return
            
            array, idx1, idx2 = frame
            
            for rect, val in zip(rects, array):
                rect.set_height(val)
                rect.set_color('skyblue')
            
            # Підсвічуємо елементи, що порівнюються
            if idx1 < len(rects):
                rects[idx1].set_color('red')
            if idx2 < len(rects):
                rects[idx2].set_color('red')
            
            iteration[0] += 1
            text.set_text(f'Операцій: {iteration[0]}')
        
        # Вибір алгоритму
        if self.algorithm_name == "Bubble Sort":
            algorithm = SortingAlgorithms.bubble_sort
        elif self.algorithm_name == "Selection Sort":
            algorithm = SortingAlgorithms.selection_sort
        else:
            print("Алгоритм не підтримує візуалізацію")
            return
        
        # Створення анімації
        generator = algorithm(self.array.copy(), visualize=True)
        frames = list(generator)
        
        ani = FuncAnimation(fig, func=update_plot, fargs=(bar_rects, iteration),
                          frames=frames, interval=100, repeat=False)
        
        plt.show()
        return ani


def performance_comparison(sizes=[100, 500, 1000]):
    """Порівняння продуктивності алгоритмів"""
    algorithms = {
        'Bubble Sort': lambda arr: SortingAlgorithms.bubble_sort(arr.copy())[0],
        'Selection Sort': lambda arr: SortingAlgorithms.selection_sort(arr.copy())[0],
        'Merge Sort': lambda arr: SortingAlgorithms.merge_sort(arr.copy())
    }
    
    results = {name: [] for name in algorithms}
    
    for size in sizes:
        print(f"\nРозмір масиву: {size}")
        arr = [random.randint(1, 1000) for _ in range(size)]
        
        for name, func in algorithms.items():
            start_time = time.time()
            func(arr)
            elapsed_time = time.time() - start_time
            results[name].append(elapsed_time)
            print(f"{name}: {elapsed_time:.4f} секунд")
    
    # Побудова графіку
    plt.figure(figsize=(10, 6))
    for name, times in results.items():
        plt.plot(sizes, times, marker='o', label=name)
    
    plt.xlabel('Розмір масиву')
    plt.ylabel('Час (секунди)')
    plt.title('Порівняння продуктивності алгоритмів сортування')
    plt.legend()
    plt.grid(True)
    plt.show()


def interactive_demo():
    """Інтерактивна демонстрація"""
    while True:
        print("\n=== Алгоритми сортування ===")
        print("1. Демонстрація Bubble Sort")
        print("2. Демонстрація Selection Sort")
        print("3. Демонстрація Merge Sort")
        print("4. Візуалізація (потрібен matplotlib)")
        print("5. Порівняння продуктивності")
        print("0. Вихід")
        
        choice = input("\nВаш вибір: ")
        
        if choice == '0':
            break
        elif choice in ['1', '2', '3']:
            # Створюємо тестовий масив
            arr = [64, 34, 25, 12, 22, 11, 90]
            print(f"Початковий масив: {arr}")
            
            if choice == '1':
                sorted_arr, comp, swaps = SortingAlgorithms.bubble_sort(arr.copy())
                print(f"Відсортований масив: {sorted_arr}")
                print(f"Порівнянь: {comp}, Обмінів: {swaps}")
            elif choice == '2':
                sorted_arr, comp, swaps = SortingAlgorithms.selection_sort(arr.copy())
                print(f"Відсортований масив: {sorted_arr}")
                print(f"Порівнянь: {comp}, Обмінів: {swaps}")
            else:
                sorted_arr = SortingAlgorithms.merge_sort(arr.copy())
                print(f"Відсортований масив: {sorted_arr}")
        
        elif choice == '4':
            try:
                algorithm = input("Виберіть алгоритм (bubble/selection): ")
                if algorithm.lower() == 'bubble':
                    viz = SortingVisualizer("Bubble Sort", 15)
                elif algorithm.lower() == 'selection':
                    viz = SortingVisualizer("Selection Sort", 15)
                else:
                    print("Невідомий алгоритм")
                    continue
                viz.visualize()
            except ImportError:
                print("Для візуалізації потрібен matplotlib")
        
        elif choice == '5':
            try:
                performance_comparison()
            except ImportError:
                print("Для графіків потрібен matplotlib")


if __name__ == "__main__":
    interactive_demo()